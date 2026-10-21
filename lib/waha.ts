/**
 * Integração com a API do WAHA (WhatsApp HTTP API)
 */
export async function enviarMensagemWhatsApp(telefone: string, texto: string) {
  const wahaUrl = process.env.WAHA_API_URL?.replace(/\/$/, '');
  const apiKey = process.env.WAHA_API_KEY || '';

  if (!wahaUrl) {
    throw new Error('A variável WAHA_API_URL não está configurada.');
  }

  // Remove caracteres não numéricos e formata como chatId do WhatsApp
  const numeroLimpo = telefone.replace(/\D/g, '');
  const chatId = `${numeroLimpo}@c.us`;

  const url = `${wahaUrl}/api/sendText`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({
      session: 'default',
      chatId: chatId,
      text: texto,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Erro ao disparar mensagem WAHA para ${chatId}:`, errorBody);
    throw new Error(`Falha no envio WAHA: ${response.status} - ${errorBody}`);
  }

  return await response.json();
}
