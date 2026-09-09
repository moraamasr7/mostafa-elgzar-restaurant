import { DomainNotificationEvent, NotificationAdapter } from './types/notification.types';
import { TelegramAdapter } from './adapters/telegram.adapter';

class NotificationService {
  private adapters: NotificationAdapter[] = [new TelegramAdapter()];

  registerAdapter(adapter: NotificationAdapter) {
    this.adapters.push(adapter);
  }

  /**
   * Dispatches domain notifications asynchronously.
   * Completely isolated: failures in any adapter will never affect the caller.
   */
  async dispatch(event: DomainNotificationEvent): Promise<void> {
    const promises = this.adapters.map(async (adapter) => {
      try {
        await adapter.send(event);
      } catch (err) {
        console.warn(`[NotificationService] Adapter ${adapter.name} failed:`, err);
      }
    });

    // Run in background / fire-and-forget
    Promise.allSettled(promises).catch(() => {});
  }
}

export const notificationService = new NotificationService();
