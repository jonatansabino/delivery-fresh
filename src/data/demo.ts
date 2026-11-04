import { z } from "zod";
import { MEALS, PLANS, CATEGORIES } from "@/lib/menu";
export const statuses = [
  "aguardando_pagamento",
  "confirmado",
  "em_preparo",
  "a_caminho",
  "entregue",
  "cancelado",
] as const;
export const STATUS: Record<(typeof statuses)[number], string> = {
  aguardando_pagamento: "Aguardando pagamento",
  confirmado: "Confirmado",
  em_preparo: "Em preparo",
  a_caminho: "A caminho",
  entregue: "Entregue",
  cancelado: "Cancelado",
};
import {
  money,
  addressSchema,
  couponSchema,
  zoneSchema,
  slotSchema,
  categorySchema,
  plannerEntrySchema,
  notificationSchema,
  reviewSchema,
  ledgerSchema,
} from "@/types/models";
import { mockDeliveryZones } from "./mockDeliveryZones";
import { mockDeliverySlots } from "./mockDeliverySlots";
import { mockCoupons } from "./mockCoupons";
import { mockCategories } from "./mockCategories";
import { mockLoyalty } from "./mockLoyalty";
export const mealSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  description: z.string().min(2),
  price: money,
  image: z.string(),
  category: z.string().min(2),
  active: z.boolean().optional(),
  ingredients: z.array(z.string()).optional(),
  allergens: z.string().optional(),
  addOns: z.array(z.object({ id: z.string(), name: z.string(), price: money })).optional(),
  tags: z.array(z.string()),
  kcal: money.nullable(),
  protein: money.nullable(),
  carbs: money.nullable(),
  fat: money.nullable(),
  weight: money,
});
export const planSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  description: z.string(),
  meals: z.number().int().min(1).max(50),
  pricePerMeal: money,
  popular: z.boolean().optional(),
  active: z.boolean().optional(),
});
export const orderSchema = z
  .object({
    id: z.string(),
    createdAt: z.string().datetime(),
    items: z.array(
      z.object({
        mealId: z.string(),
        name: z.string(),
        price: money,
        qty: z.number().int().positive(),
        addOns: z.array(z.object({ id: z.string(), name: z.string(), price: money })).optional(),
      }),
    ),
    planId: z.string().optional(),
    planName: z.string().optional(),
    subtotal: money,
    delivery: money,
    discount: money,
    total: money,
    payment: z.literal("whatsapp"),
    status: z.enum(statuses),
    address: z.string(),
    name: z.string(),
    phone: z.string(),
    deliveryDate: z.string(),
    addressDetails: addressSchema.optional(),
    observations: z.string().max(500).optional(),
    slotId: z.string().optional(),
    statusHistory: z
      .array(z.object({ status: z.enum(statuses), date: z.string().datetime() }))
      .optional(),
    planner: z.array(plannerEntrySchema).optional(),
    couponCode: z.string().optional(),
  })
  .refine(
    (o) => new Set(o.items.map((i) => i.mealId)).size === o.items.length,
    "Produtos duplicados no pedido.",
  )
  .refine(
    (o) =>
      o.discount <= o.subtotal &&
      Math.abs(o.total - (o.subtotal + o.delivery - o.discount)) < 0.011,
    "Totais do pedido inválidos.",
  );

export type Order = z.infer<typeof orderSchema>;
export type { Customer, AppSettings, CategoryData, Coupon } from "@/types/models";
import { mockCustomers as customers } from "./mockCustomers";
import { mockSettings as settings } from "./mockSettings";
import { mockOrders as orders } from "./mockOrders";
export { customers, settings, orders };
export const deliveries: { id: string; orderId: string; date: string; window: string }[] =
  orders.map((o) => ({
    id: `entrega-${o.id}`,
    orderId: o.id,
    date: o.deliveryDate,
    window: "09h às 18h",
  }));
export const stateSchema = z.object({
  items: z.record(z.string(), z.number().int().min(1).max(99)),
  planId: z.string().optional(),
  orders: z.array(orderSchema),
  meals: z.array(mealSchema),
  plans: z.array(planSchema),
  customers: z.array(
    z.object({ id: z.string(), name: z.string().min(2), phone: z.string(), address: z.string() }),
  ),
  addresses: z.array(z.string().min(8)),
  preferences: z.object({
    name: z.string(),
    phone: z.string(),
    diet: z.string(),
    email: z.string().default(""),
    theme: z.enum(["light", "dark", "system"]).default("system"),
  }),
  settings: z.object({
    whatsapp: z.string().regex(/^\d{10,15}$/),
    deliveryFee: money,
    storeName: z.string().min(2),
  }),
  coupon: z.string(),
  version: z.literal(3).default(3),
  categories: z.array(categorySchema).default(mockCategories),
  coupons: z.array(couponSchema).default(mockCoupons),
  deliveryZones: z.array(zoneSchema).default(mockDeliveryZones),
  deliverySlots: z.array(slotSchema).default(mockDeliverySlots),
  addressBook: z.array(addressSchema).default([]),
  selectedAddressId: z.string().default(""),
  favorites: z.array(z.string()).default([]),
  planner: z.array(plannerEntrySchema).default([]),
  wizard: z
    .object({
      step: z.number().int().min(1).max(8),
      goal: z.string(),
      preferences: z.array(z.string()),
      deliveryDate: z.string(),
      slotId: z.string(),
      observations: z.string(),
    })
    .default({
      step: 1,
      goal: "Manutenção",
      preferences: [],
      deliveryDate: "",
      slotId: "",
      observations: "",
    }),
  cartAddOns: z.record(z.string(), z.array(z.string())).default({}),
  usedCoupons: z.record(z.string(), z.number().int().nonnegative()).default({}),
  notifications: z.array(notificationSchema).max(200).default([]),
  reviews: z.array(reviewSchema).default([
    {
      id: "review-demo",
      mealId: "frango-arroz-feijao",
      name: "Ana Exemplo",
      rating: 5,
      comment: "Avaliação fictícia para demonstrar a interface.",
      date: "2026-11-03T12:00:00.000Z",
      demo: true,
    },
  ]),
  loyalty: z.array(ledgerSchema).default(mockLoyalty),
  redeemedRewards: z.array(z.string()).default([]),
  production: z.record(z.string(), z.number().int().nonnegative()).default({}),
});
export type AppState = z.infer<typeof stateSchema>;
export const initialState: AppState = stateSchema.parse({
  items: {},
  orders,
  meals: MEALS,
  plans: PLANS,
  customers,
  addresses: [],
  preferences: { name: "", phone: "", diet: "Todas" },
  settings,
  coupon: "",
});
