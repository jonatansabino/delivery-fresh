export type Category = string;

export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  tags: string[];
  kcal: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  weight: number;
  active?: boolean | undefined;
  ingredients?: string[] | undefined;
  allergens?: string | undefined;
  addOns?: import("@/types/models").AddOn[] | undefined;
}

export interface Plan {
  id: string;
  name: string;
  meals: number;
  pricePerMeal: number;
  popular?: boolean | undefined;
  active?: boolean | undefined;
  description: string;
}
