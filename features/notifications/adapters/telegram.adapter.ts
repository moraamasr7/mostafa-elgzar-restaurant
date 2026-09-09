import { NotificationAdapter, DomainNotificationEvent } from '../types/notification.types';

export class TelegramAdapter implements NotificationAdapter {
  name = 'Telegram';

  async send(event: DomainNotificationEvent): Promise<boolean> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      // Telegram bot is not configured yet - silently skip
      return true;
    }

    try {
      if (event.type === 'order.created') {
        const typeLabel = event.orderType === 'delivery' ? '🛵 دليفري (توصيل)' : '🏪 استلام من الفرع (تيك اواي)';
        const payLabel = event.paymentMethod === 'cash' ? '💵 كاش' : event.paymentMethod === 'instapay' ? '⚡ إنستا باي' : '📱 محفظة إلكترونية';

        const lines = [
          `🔔 <b>طلب جديد في مطعم مصطفى الجزار!</b>`,
          ``,
          `🏷️ <b>رقم الطلب:</b> #${event.orderNumber}`,
          `👤 <b>اسم العميل:</b> ${escapeHtml(event.customerName)}`,
          `📞 <b>الموبايل:</b> <code>${escapeHtml(event.customerPhone)}</code>`,
          `📦 <b>نوع الطلب:</b> ${typeLabel}`,
          `💰 <b>الإجمالي:</b> <b>${event.totalAmount} ج.م</b>`,
          `💳 <b>طريقة الدفع:</b> ${payLabel}`,
        ];

        if (event.deliveryAddress) {
          lines.push(`📍 <b>العنوان:</b> ${escapeHtml(event.deliveryAddress)}`);
        }

        if (event.paymentReceiptUrl) {
          lines.push(`🧾 <b>إثبات التحويل:</b> ${escapeHtml(event.paymentReceiptUrl)}`);
        }

        if (event.notes) {
          lines.push(`📝 <b>ملاحظات:</b> ${escapeHtml(event.notes)}`);
        }

        lines.push(``);
        lines.push(`⏰ <i>الوقت: ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</i>`);

        const messageText = lines.join('\n');

        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: messageText,
            parse_mode: 'HTML',
            disable_web_page_preview: false,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn('[TelegramAdapter] Failed to send Telegram message:', errText);
          return false;
        }

        return true;
      }

      return true;
    } catch (err) {
      console.warn('[TelegramAdapter] Exception sending message to Telegram:', err);
      // Strictly non-blocking: never throw
      return false;
    }
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
