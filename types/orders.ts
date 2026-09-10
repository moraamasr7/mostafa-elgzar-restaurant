export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'ready'
  | 'assigned'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type OrderType = 'takeaway' | 'delivery' | 'dine_in';
export type PaymentMethod = 'cash' | 'instapay' | 'wallet';

export interface CartLine {
  variant_id: string;
  item_name: string;
  variant_name: string;
  price: number;
  quantity: number;
  item_notes?: string;
}

export interface OrderItemInput {
  variant_id: string;
  quantity: number;
  item_notes?: string;
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_phone: string;
  notes?: string;
  order_type?: OrderType;
  delivery_address?: string;
  payment_method?: PaymentMethod;
  payment_receipt_url?: string;
  items: OrderItemInput[];
  turnstile_token?: string;
}

export interface OrderCreatedResponse {
  order_id: string;
  order_number: number;
  total_amount: number;
  tracking_token: string;
}

export interface OrderEntity {
  id: string;
  order_number: number;
  status: OrderStatus;
  order_type: OrderType;
  customer_name: string;
  customer_phone: string;
  delivery_address?: string | null;
  payment_method: PaymentMethod;
  payment_receipt_url?: string | null;
  total_amount: number;
  driver_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface StatusUIConfig {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const STATUS_UI_CONFIG: Record<OrderStatus, StatusUIConfig> = {
  pending: {
    label: 'في انتظار التأكيد',
    icon: '🕐',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  processing: {
    label: 'جاري التحضير والشواء',
    icon: '🔥',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  ready: {
    label: 'جاهز بالفرع',
    icon: '📦',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  assigned: {
    label: 'تم تكليف الطيار',
    icon: '🛵',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
  },
  picked_up: {
    label: 'تم استلام الطيار',
    icon: '🎒',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
  },
  out_for_delivery: {
    label: 'في الطريق للعميل',
    icon: '🚚',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  delivered: {
    label: 'تم التوصيل بنجاح',
    icon: '🎉',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  completed: {
    label: 'تم الاستلام بالفرع',
    icon: '✅',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  failed: {
    label: 'تعذر التوصيل',
    icon: '⚠️',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
  cancelled: {
    label: 'تم الإلغاء',
    icon: '❌',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
};

export type DeliveryFailureReason =
  | 'customer_unreachable'
  | 'wrong_address'
  | 'customer_refused'
  | 'damaged_in_transit'
  | 'other';
