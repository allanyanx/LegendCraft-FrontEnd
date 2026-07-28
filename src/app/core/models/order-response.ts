import { OrderItemResponse } from './order-item-response';

export interface OrderResponse {
  id: number;
  userId?: string;
  guestEmail?: string;
  guestFirstName?: string;
  guestLastName?: string;
  orderDate: Date;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  contactPhone: string;
  paymentMethod: string;
  trackingNumber: string;
  items: OrderItemResponse[];
}
