import { env } from '../../config/env';

/**
 * Envia uma mensagem de texto simples via WhatsApp usando a Evolution API.
 * 
 * @param number O número do destinatário com DDI e DDD (ex: 5511999999999)
 * @param text O conteúdo da mensagem
 */
export async function sendWhatsAppMessage(number: string, text: string): Promise<any> {
  const { apiUrl, apiKey, notificationsInstance } = env.evolutionApi;

  if (!apiUrl || !apiKey) {
    console.error('[WhatsApp] Credenciais da Evolution API não encontradas no arquivo .env');
    throw new Error('Evolution API credentials missing');
  }

  // Limpa o número (remove espaços, traços, parênteses)
  const cleanNumber = number.replace(/\D/g, '');

  try {
    const response = await fetch(`${apiUrl}/message/sendText/${notificationsInstance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: cleanNumber,
        text: text,
        options: {
          delay: 1200,
          presence: 'composing'
        }
      })
    });

    const data = await response.json() as any;

    if (!response.ok) {
      console.error('[WhatsApp] Erro ao enviar mensagem:', data);
      throw new Error(data.message || 'Error sending WhatsApp message');
    }

    return data;
  } catch (error) {
    console.error('[WhatsApp] Falha na comunicação com a API:', error);
    throw error;
  }
}
