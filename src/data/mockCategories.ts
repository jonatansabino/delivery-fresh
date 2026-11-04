const CATEGORIES = ["Frango", "Carne", "Peixe", "Vegano", "Low Carb"];
import type { CategoryData } from "@/types/models";
export const mockCategories: CategoryData[] = CATEGORIES.map((name, i) => ({
  id: String(i),
  name,
  active: true,
}));
