import type { Coupon } from "@/types/models";
export const mockCoupons: Coupon[] = [
  {
    code: "FIT10",
    type: "percent",
    value: 10,
    minPurchase: 0,
    expiresAt: "2027-12-31",
    limit: 20,
    active: true,
  },
  {
    code: "BEMVINDO",
    type: "fixed",
    value: 5,
    minPurchase: 30,
    expiresAt: "2027-12-31",
    limit: 1,
    active: true,
  },
];
