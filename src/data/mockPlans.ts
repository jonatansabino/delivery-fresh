import type { Plan } from "@/types/catalog";
export const mockPlans: Plan[] = [
  {
    id: "essencial",
    name: "Essencial",
    meals: 5,
    pricePerMeal: 22,
    description: "Para os dias úteis da semana.",
  },
  {
    id: "executivo",
    name: "Executivo",
    meals: 10,
    pricePerMeal: 20,
    popular: true,
    description: "Almoço e jantar de segunda a sexta.",
  },
  {
    id: "casal",
    name: "Casal/Foco",
    meals: 15,
    pricePerMeal: 19,
    description: "Para dividir ou para quem leva a dieta a sério.",
  },
];

for (const plan of mockPlans) plan.active = true;
