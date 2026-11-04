import { z } from "zod";
export const money = z.number().finite().min(0).max(100000);
export const ufList = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;
export const addressSchema = z
  .object({
    id: z.string().min(1),
    cep: z.string().regex(/^\d{8}$/, "CEP deve conter oito dígitos."),
    street: z.string().trim().min(2, "Informe o logradouro.").max(150),
    number: z.string().trim().max(20),
    noNumber: z.boolean(),
    complement: z.string().max(100),
    neighborhood: z.string().trim().min(2, "Informe o bairro.").max(100),
    city: z.string().trim().min(2, "Informe a cidade.").max(100),
    uf: z.enum(ufList),
    reference: z.string().max(150),
    label: z.string().max(50),
    primary: z.boolean(),
  })
  .refine((a) => a.noNumber || a.number.length > 0, {
    message: "Informe o número ou selecione Sem número.",
    path: ["number"],
  });
export type Address = z.infer<typeof addressSchema>;
export const blankAddress = (): Address => ({
  id: crypto.randomUUID(),
  cep: "",
  street: "",
  number: "",
  noNumber: false,
  complement: "",
  neighborhood: "",
  city: "",
  uf: "SP",
  reference: "",
  label: "Casa",
  primary: false,
});
export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .regex(/^[A-Z0-9_-]{2,30}$/),
    type: z.enum(["percent", "fixed"]),
    value: money,
    minPurchase: money,
    expiresAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine(
        (v) => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v,
        "Data inválida.",
      ),
    limit: z.number().int().min(1).max(10000),
    active: z.boolean(),
  })
  .refine((c) => c.type !== "percent" || c.value <= 100, {
    message: "Percentual deve estar entre 0 e 100.",
  });
export type Coupon = z.infer<typeof couponSchema>;
export const zoneSchema = z.object({
  id: z.string(),
  city: z.string().min(2),
  neighborhood: z.string().min(2),
  uf: z.enum(ufList),
  fee: money,
  estimate: z.string(),
  active: z.boolean(),
});
export type DeliveryZone = z.infer<typeof zoneSchema>;
export const slotSchema = z.object({
  id: z.string(),
  weekday: z.number().int().min(0).max(6),
  label: z.string(),
  active: z.boolean(),
});
export type DeliverySlot = z.infer<typeof slotSchema>;
export const categorySchema = z.object({
  id: z.string(),
  name: z.string().trim().min(2).max(40),
  active: z.boolean(),
});
export type CategoryData = z.infer<typeof categorySchema>;
export const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"] as const;
export const plannerEntrySchema = z.object({
  id: z.string(),
  mealId: z.string(),
  day: z.number().int().min(0).max(6),
});
export type PlannerEntry = z.infer<typeof plannerEntrySchema>;
export const notificationSchema = z.object({
  id: z.string(),
  text: z.string(),
  date: z.string().datetime(),
  read: z.boolean(),
});
export type LocalNotification = z.infer<typeof notificationSchema>;
export const reviewSchema = z.object({
  id: z.string(),
  mealId: z.string(),
  name: z.string().min(2).max(80),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500),
  date: z.string().datetime(),
  demo: z.boolean(),
});
export type Review = z.infer<typeof reviewSchema>;
export const ledgerSchema = z.object({
  id: z.string(),
  orderId: z.string().optional(),
  points: z.number().int(),
  text: z.string(),
  date: z.string().datetime(),
});
export type LoyaltyEntry = z.infer<typeof ledgerSchema>;
export interface Reward {
  id: string;
  name: string;
  points: number;
}
export interface AddOn {
  id: string;
  name: string;
  price: number;
}
export interface Nutrition {
  kcal: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}
export interface AppSettings {
  whatsapp: string;
  deliveryFee: number;
  storeName: string;
}
