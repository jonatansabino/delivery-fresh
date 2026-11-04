import type { DeliverySlot } from "@/types/models";
export const mockDeliverySlots: DeliverySlot[] = [1, 2, 3, 4, 5, 6].map((weekday) => ({
  id: `slot-${weekday}`,
  weekday,
  label: "09h às 18h • a confirmar",
  active: true,
}));
