import { OrderStatus } from '@/types/orders';
import { OrderStateMachine } from './order-state-machine';

export interface OrderOperationalEntity {
  id: string;
  order_number: number;
  status: OrderStatus;
  order_type: 'delivery' | 'takeaway' | 'dine_in';
  driver_id?: string | null;
  delivery_failed_reason?: string | null;
  cancellation_reason?: string | null;
  internal_notes?: string | null;
}

export interface OperationResult<T = any> {
  success: boolean;
  error?: string;
  order?: T;
  changes?: Record<string, any>;
}

export class OrderOperations {
  /**
   * Explicit Domain Operation: Unassign Driver
   * Clears driver association and resets order status to 'ready'
   */
  static unassignDriver(
    order: OrderOperationalEntity,
    reason: string
  ): OperationResult {
    if (!order.driver_id && order.status !== 'assigned') {
      return {
        success: false,
        error: 'هذا الطلب غير مسند لأي سائق حالياً.',
      };
    }

    if (order.status !== 'assigned' && order.status !== 'picked_up') {
      return {
        success: false,
        error: `لا يمكن سحب الطلب من السائق وهو في حالة "${order.status}".`,
      };
    }

    const note = `[${new Date().toISOString()}] تم إلغاء إسناد السائق: ${reason}`;
    const updatedNotes = order.internal_notes ? `${order.internal_notes}\n${note}` : note;

    return {
      success: true,
      changes: {
        status: 'ready' as OrderStatus,
        driver_id: null,
        internal_notes: updatedNotes,
      },
    };
  }

  /**
   * Explicit Domain Operation: Assign Driver
   */
  static assignDriver(
    order: OrderOperationalEntity,
    driverId: string,
    driverStatus: string
  ): OperationResult {
    if (order.order_type !== 'delivery') {
      return {
        success: false,
        error: 'لا يمكن إسناد سائق لطلب غير مخصص للتوصيل (تيك أواي أو صالة).',
      };
    }

    if (driverStatus !== 'active' && driverStatus !== 'on_shift') {
      return {
        success: false,
        error: 'السائق المحدد ليس في وردية عمل نشطة حالياً.',
      };
    }

    const validation = OrderStateMachine.validateTransition(order.status, 'assigned', 'delivery');
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
      };
    }

    return {
      success: true,
      changes: {
        status: 'assigned' as OrderStatus,
        driver_id: driverId,
      },
    };
  }

  /**
   * Explicit Domain Operation: Record Delivery Failure
   */
  static markDeliveryFailed(
    order: OrderOperationalEntity,
    reason: string
  ): OperationResult {
    if (order.order_type !== 'delivery') {
      return {
        success: false,
        error: 'فشل التوصيل ينطبق فقط على طلبات التوصيل المنزلي.',
      };
    }

    const validation = OrderStateMachine.validateTransition(order.status, 'delivery_failed', 'delivery');
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const note = `[فشل التوصيل] ${reason}`;
    const updatedNotes = order.internal_notes ? `${order.internal_notes}\n${note}` : note;

    return {
      success: true,
      changes: {
        status: 'delivery_failed' as OrderStatus,
        delivery_failed_reason: reason,
        internal_notes: updatedNotes,
      },
    };
  }

  /**
   * Explicit Domain Operation: Cancel Order
   */
  static cancelOrder(
    order: OrderOperationalEntity,
    reason: string
  ): OperationResult {
    const validation = OrderStateMachine.validateTransition(order.status, 'cancelled', order.order_type);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const note = `[إلغاء الطلب] ${reason}`;
    const updatedNotes = order.internal_notes ? `${order.internal_notes}\n${note}` : note;

    return {
      success: true,
      changes: {
        status: 'cancelled' as OrderStatus,
        cancellation_reason: reason,
        internal_notes: updatedNotes,
      },
    };
  }
}
