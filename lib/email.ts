type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function getEmailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.ORDER_NOTIFICATION_FROM_EMAIL || "MAI Natural <hola@mainatural.com>",
    replyTo: process.env.ORDER_NOTIFICATION_REPLY_TO || process.env.ORDER_PROOF_EMAIL,
  };
}

export async function sendTransactionalEmail(input: SendEmailInput) {
  const { apiKey, from, replyTo } = getEmailConfig();

  if (!apiKey) {
    console.warn("RESEND_API_KEY no configurada. Correo transaccional omitido.", {
      to: input.to,
      subject: input.subject,
    });
    return { sent: false, reason: "missing_api_key" as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      reply_to: replyTo ? [replyTo] : undefined,
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`No se pudo enviar el correo transaccional: ${errorBody}`);
  }

  return { sent: true as const };
}
