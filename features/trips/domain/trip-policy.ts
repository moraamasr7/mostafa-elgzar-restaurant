import { Trip, TripStatus } from '@/types/trips';
import { OrderEntity } from '@/types/orders';

export const MAX_ORDERS_PER_TRIP = 5;

export interface TripPolicyEvaluation {
  allowed: boolean;
  reason?: string;
}

export class TripPolicy {
  /**
   * Evaluates if an order can be added to an active trip
   */
  static canAddOrder(
    currentTripOrdersCount: number,
    tripStatus: TripStatus,
    order: { order_type: string; status: string }
  ): TripPolicyEvaluation {
    if (tripStatus !== 'draft' && tripStatus !== 'assigned') {
      return {
        allowed: false,
        reason: `لا يمكن إضافة طلبات إلى رحلة بحالة "${tripStatus}". الرحلة قيد التوصيل أو منتهية.`,
      };
    }

    if (currentTripOrdersCount >= MAX_ORDERS_PER_TRIP) {
      return {
        allowed: false,
        reason: `تم بلوغ الحد الأقصى للطلبات في الرحلة الواحدة (${MAX_ORDERS_PER_TRIP} طلبات) للحفاظ على حرارة وجودة الطعام.`,
      };
    }

    if (order.order_type !== 'delivery') {
      return {
        allowed: false,
        reason: 'فقط طلبات التوصيل المنزلي يمكن إدراجها ضمن رحلات السائقين.',
      };
    }

    if (order.status !== 'ready' && order.status !== 'assigned') {
      return {
        allowed: false,
        reason: `الطلب بحالة "${order.status}"؛ يجب أن يكون الطلب "جاهز" للتسليم لإدراجه في رحلة.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Evaluates if a driver can take a new trip
   */
  static canDriverTakeTrip(driver: {
    is_active: boolean;
    active_trips_count?: number;
  }): TripPolicyEvaluation {
    if (!driver.is_active) {
      return {
        allowed: false,
        reason: 'السائق غير مفعل أو ليس في وردية عمل حالياً.',
      };
    }

    if (driver.active_trips_count && driver.active_trips_count > 0) {
      return {
        allowed: false,
        reason: 'السائق لديه رحلة نشطة جارية بالفعل حالياً. يجب إنهاء الرحلة الحالية أولاً.',
      };
    }

    return { allowed: true };
  }
}
