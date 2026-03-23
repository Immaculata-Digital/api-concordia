import { randomBytes } from 'crypto'

let lastTimestamp = -1
let lastCounter = 0

/**
 * Gera um UUID v7 (Time-ordered) conforme a RFC 9562.
 * Implementa contador monótono para IDs gerados no mesmo milissegundo.
 */
export function generateUUID(): string {
    let timestamp = Date.now()

    if (timestamp <= lastTimestamp) {
        timestamp = lastTimestamp
        lastCounter++
    } else {
        lastTimestamp = timestamp
        lastCounter = 0
    }

    // 48 bits de timestamp
    const tsHex = timestamp.toString(16).padStart(12, '0')

    // 12 bits de "sequência" (contador + aleatório)
    // Usamos os primeiros 12 bits para o contador monótono (max 4095)
    // Se o contador estourar, ele apenas incrementa o milissegundo virtualmente
    if (lastCounter > 4095) {
        lastTimestamp++
        timestamp = lastTimestamp
        lastCounter = 0
    }

    const counterEntropy = lastCounter.toString(16).padStart(3, '0')
    
    // 4 bits de versão (7) + 12 bits de counterEntropy
    // Formato: 7xxx
    const verAndEntropy = `7${counterEntropy}`

    // Variante (10) + 62 bits de entropia aleatória
    const randomSuffix = randomBytes(8)
    const variantAndEntropy = ((randomSuffix[0] & 0x3f) | 0x80).toString(16).padStart(2, '0')
    const restOfEntropy = randomSuffix.slice(1).toString('hex')

    // Formato: xxxxxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx
    return `${tsHex.slice(0, 8)}-${tsHex.slice(8, 12)}-${verAndEntropy}-${variantAndEntropy}${restOfEntropy.slice(0, 2)}-${restOfEntropy.slice(2)}`
}
