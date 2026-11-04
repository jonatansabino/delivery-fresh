import type { Order } from "./demo";
import { mockCustomers } from "./mockCustomers";
import { mockProducts } from "./mockProducts";
export const mockOrders: Order[] = mockCustomers.map((c, i) => ({
  id: `DEMO-00${i + 1}`,
  createdAt: "2026-11-03T15:00:00.000Z",
  name: c.name,
  address: c.address,
  phone: c.phone,
  items: [{ mealId: mockProducts[0]!.id, name: mockProducts[0]!.name, price: 24.9, qty: 2 }],
  subtotal: 49.8,
  delivery: 7.9,
  discount: 0,
  total: 57.7,
  payment: "whatsapp",
  status: i ? "em_preparo" : "entregue",
  deliveryDate: "2026-11-05",
}));
