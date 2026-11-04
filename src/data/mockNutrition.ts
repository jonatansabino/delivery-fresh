import { MEALS } from "@/lib/menu";
import type { Nutrition } from "@/types/models";
export const mockNutrition: Record<string, Nutrition> = Object.fromEntries(
  MEALS.map((m) => [m.id, { kcal: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat }]),
);
