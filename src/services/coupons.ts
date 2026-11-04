import type { Coupon } from "@/types/models";
import { localDate } from "./whatsapp";
export function checkCoupon(
  code: string,
  subtotal: number,
  coupons: Coupon[],
  used: Record<string, number>,
  today = localDate(),
) {
  if (!code) return { discount: 0, error: "" };
  const coupon = coupons.find((c) => c.code === code);
  if (!coupon || !coupon.active) return { discount: 0, error: "Cupom inválido ou inativo." };
  if (coupon.expiresAt < today) return { discount: 0, error: "Cupom expirado." };
  if ((used[code] ?? 0) >= coupon.limit)
    return { discount: 0, error: "Limite local de utilização atingido." };
  if (subtotal < coupon.minPurchase)
    return { discount: 0, error: `Compra mínima: R$ ${coupon.minPurchase.toFixed(2)}.` };
  return {
    discount:
      Math.round(
        Math.min(
          subtotal,
          coupon.type === "fixed" ? coupon.value : (subtotal * coupon.value) / 100,
        ) * 100,
      ) / 100,
    error: "",
  };
}
