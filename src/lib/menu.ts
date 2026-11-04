import { mockProducts } from "@/data/mockProducts";
import { mockPlans } from "@/data/mockPlans";
import { mockCategories } from "@/data/mockCategories";
export type { Meal, Plan, Category } from "@/types/catalog";
export const MEALS = mockProducts;
export const PLANS = mockPlans;
export const CATEGORIES = mockCategories.map((c) => c.name);
export const DELIVERY_FEE = 7.9;
export const WHATSAPP_NUMBER = "5511999999999";

export const getMeal = (id: string) => MEALS.find((m) => m.id === id);
export const getPlan = (id: string) => PLANS.find((p) => p.id === id);

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
