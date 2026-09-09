import { OrderStatus, OrderType } from '@/types/orders';

export interface OrderStateTransitionResult {
  success: boolean;
  error?: string;
  nextStatus?: OrderStatus;
}

/**
 * Valid transitions graph based on business rules:
 * - dine_in / takeaway orders skip delivery states: ready -> completed
 * - delivery orders: ready -> assigned -> picked_up -> out_for_delivery -> delivered -> completed
 * - delivery_failed is distinct from cancelled: can be returned_to_branch or retried
 * - unassigning driver rolls back assigned/picked_up to ready (handled via unassignDriver operation)
 */
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['ready', 'cancelled'],
  ready: ['assigned', 'completed', 'cancelled'], // completed directly for takeaway/dine_in
  assigned: ['picked_up', 'ready', 'cancelled'], // 'ready' when driver unassigned
  picked_up: ['out_for_delivery', 'ready', 'delivery_failed', 'cancelled'],
  out_for_delivery: ['delivered', 'delivery_failed', 'cancelled'],
  delivered: ['completed'],
  delivery_failed: ['returned_to_branch', 'ready', 'cancelled'],
  returned_to_branch: ['ready', 'cancelled'],
  completed: [], // Terminal
  cancelled: [], // Terminal
};

export class OrderStateMachine {
  /**
   * Checks whether a status transition is permitted given current state and order type.
   */
  static canTransition(from: OrderStatus, to: OrderStatus, orderType: OrderType = 'delivery'): boolean {
    if (from === to) return false;

    // Terminal states cannot transition
    if (from === 'completed' || from === 'cancelled') {
      return false;
    }

    // Takeaway & Dine-in bypass delivery-specific statuses
    if (orderType !== 'delivery') {
      const deliverySpecificStatuses: OrderStatus[] = [
        'assigned',
        'picked_up',
        'out_for_delivery',
        'delivered',
        'delivery_failed',
        'returned_to_branch',
      ];
      if (deliverySpecificStatuses.includes(to)) {
        return false;
      }
      if (from === 'ready' && to === 'completed') {
        return true;
      }
    }

    const allowed = VALID_TRANSITIONS[from] || [];
    return allowed.includes(to);
  }

  /**
   * Returns list of reachable states from current status
   */
  static getAllowedTransitions(currentStatus: OrderStatus, orderType: OrderType = 'delivery'): OrderStatus[] {
    const reachable = VALID_TRANSITIONS[currentStatus] || [];
    return reachable.filter((to) => this.canTransition(currentStatus, to, orderType));
  }

  /**
   * Evaluates transition request and returns domain validation result
   */
  static validateTransition(
    currentStatus: OrderStatus,
    targetStatus: OrderStatus,
    orderType: OrderType = 'delivery'
  ): OrderStateTransitionResult {
    if (!this.canTransition(currentStatus, targetStatus, orderType)) {
      return {
        success: false,
        error: `غير مسموح بالانتقال من حالة "${currentStatus}" إلى حالة "${targetStatus}" لنوع الطلب "${orderType}"`,
      };
    }

    return {
      success: true,
      nextStatus: targetStatus,
    };
  }
}
