/** `https://wa.me/905324935198?text=...`; the number is the digits of the settings' WhatsApp number. Plain code, so client components may use it. */
export const whatsappUrl = (number: string, message?: string) =>
  `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
