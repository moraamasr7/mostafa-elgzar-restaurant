export interface OrderCreatedEvent {
  type: 'order.created';
  orderId: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  orderType: string;
  deliveryAddress?: string | null;
  paymentMethod: string;
  paymentReceiptUrl?: string | null;
  totalAmount: number;
  notes?: string | null;
  trackingToken?: string;
  itemsCount: number;
  createdAt: string;
}

export type DomainNotificationEvent = OrderCreatedEvent;

export interface NotificationAdapter {
  name: string;
  send(event: DomainNotificationEvent): Promise<boolean>;
}
