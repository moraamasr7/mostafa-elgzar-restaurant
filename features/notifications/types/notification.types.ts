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

export interface ReservationCreatedEvent {
  type: 'reservation.created';
  reservationNumber: number;
  customerName: string;
  customerPhone: string;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  notes?: string | null;
  createdAt: string;
}

export interface FeedbackReceivedEvent {
  type: 'feedback.received';
  customerName: string;
  customerPhone: string;
  feedbackType: 'suggestion' | 'complaint';
  message: string;
  createdAt: string;
}

export type DomainNotificationEvent = OrderCreatedEvent | ReservationCreatedEvent | FeedbackReceivedEvent;

export interface NotificationAdapter {
  name: string;
  send(event: DomainNotificationEvent): Promise<boolean>;
}
