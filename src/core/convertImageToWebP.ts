import sharp from 'sharp'

/**
 * Mimetypes de imagem suportados para conversão WebP.
 * Qualquer outro mimetype (vídeo, PDF, etc.) é ignorado.
 */
const SUPPORTED_IMAGE_MIMETYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/avif',
    'image/webp',
])

interface ConvertedImage {
    base64: string
    fileSize: number
}

/**
 * Converte uma imagem em Data URI (base64) para o formato WebP
 * com qualidade alta (85%), sem perda perceptível de qualidade.
 *
 * Se o mimetype não for uma imagem suportada, retorna o dado original sem alterações.
 *
 * @param dataUri - String completa `data:image/png;base64,iVBOR...`
 * @returns `{ base64, fileSize }` — nova Data URI em WebP e tamanho em bytes
 */
export async function convertImageToWebP(dataUri: string): Promise<ConvertedImage> {
    const commaIndex = dataUri.indexOf(',')
    const prefix = commaIndex !== -1 ? dataUri.substring(0, commaIndex) : ''

    // Verifica se é um Data URI válido de imagem (data:image/png;base64,...)
    if (!prefix.startsWith('data:') || !prefix.includes(';base64')) {
        return { base64: dataUri, fileSize: Buffer.byteLength(dataUri, 'utf-8') }
    }

    const mimetype = prefix.substring(5, prefix.indexOf(';')).toLowerCase()

    if (!SUPPORTED_IMAGE_MIMETYPES.has(mimetype)) {
        return { base64: dataUri, fileSize: Buffer.byteLength(dataUri, 'utf-8') }
    }

    try {
        const rawBase64 = dataUri.substring(commaIndex + 1)
        const inputBuffer = Buffer.from(rawBase64, 'base64')
        const webpBuffer = await sharp(inputBuffer)
            .webp({ quality: 85 })
            .toBuffer()

        const webpBase64 = webpBuffer.toString('base64')

        return {
            base64: `data:image/webp;base64,${webpBase64}`,
            fileSize: webpBuffer.length,
        }
    } catch (err) {
        console.error('[convertImageToWebP] Falha na conversão, salvando original:', err)
        return { base64: dataUri, fileSize: Buffer.byteLength(dataUri, 'utf-8') }
    }
}
