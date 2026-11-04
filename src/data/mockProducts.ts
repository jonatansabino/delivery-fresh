import frango from "@/assets/meal-frango.jpg";
import salmao from "@/assets/meal-salmao.jpg";
import vegano from "@/assets/meal-vegano.jpg";
import hero from "@/assets/hero.jpg";

import type { Meal } from "@/types/catalog";
export const mockProducts: Meal[] = [
  {
    id: "frango-arroz-feijao",
    name: "Frango Grelhado com Arroz e Feijão Preto",
    description:
      "Peito de frango grelhado com ervas, arroz branco soltinho, feijão preto e brócolis no vapor.",
    price: 24.9,
    image: frango,
    category: "Frango",
    tags: ["Rico em proteína", "Sem lactose"],
    kcal: 520,
    protein: 42,
    carbs: 55,
    fat: 12,
    weight: 400,
  },
  {
    id: "salmao-quinoa",
    name: "Salmão com Quinoa e Aspargos",
    description:
      "Filé de salmão grelhado, quinoa tricolor com salsinha e aspargos salteados no azeite.",
    price: 34.9,
    image: salmao,
    category: "Peixe",
    tags: ["Ômega 3", "Sem glúten"],
    kcal: 560,
    protein: 38,
    carbs: 40,
    fat: 24,
    weight: 380,
  },
  {
    id: "bowl-vegano",
    name: "Bowl Vegano de Grão-de-Bico",
    description:
      "Grão-de-bico tostado, abóbora assada, tofu temperado, couve refogada e arroz integral.",
    price: 26.9,
    image: vegano,
    category: "Vegano",
    tags: ["Vegano", "Rico em fibras"],
    kcal: 480,
    protein: 24,
    carbs: 62,
    fat: 14,
    weight: 420,
  },
  {
    id: "frango-batata-doce",
    name: "Frango com Batata-Doce e Legumes",
    description: "Frango em cubos, batata-doce assada, brócolis e cenoura. Clássico do pré-treino.",
    price: 23.9,
    image: hero,
    category: "Low Carb",
    tags: ["Pré-treino", "Sem glúten"],
    kcal: 450,
    protein: 40,
    carbs: 38,
    fat: 10,
    weight: 400,
  },
  {
    id: "frango-low-carb",
    name: "Frango ao Limão Low Carb",
    description: "Sobrecoxa desossada ao limão siciliano com purê de couve-flor e mix de folhas.",
    price: 25.9,
    image: frango,
    category: "Low Carb",
    tags: ["Low carb", "Sem glúten"],
    kcal: 390,
    protein: 36,
    carbs: 14,
    fat: 20,
    weight: 350,
  },
  {
    id: "patinho-arroz-integral",
    name: "Patinho Moído com Arroz Integral",
    description: "Patinho moído refogado com tomate, arroz integral, abobrinha e vagem.",
    price: 26.9,
    image: hero,
    category: "Carne",
    tags: ["Rico em proteína"],
    kcal: 540,
    protein: 40,
    carbs: 48,
    fat: 18,
    weight: 400,
  },
  {
    id: "tilapia-pure",
    name: "Tilápia com Purê de Mandioquinha",
    description: "Tilápia grelhada com crosta de ervas, purê de mandioquinha e ervilha-torta.",
    price: 29.9,
    image: salmao,
    category: "Peixe",
    tags: ["Leve", "Sem glúten"],
    kcal: 430,
    protein: 34,
    carbs: 36,
    fat: 14,
    weight: 380,
  },
  {
    id: "tofu-legumes",
    name: "Tofu Grelhado com Legumes Assados",
    description: "Tofu marinado no shoyu, legumes assados e arroz integral com gergelim.",
    price: 24.9,
    image: vegano,
    category: "Vegano",
    tags: ["Vegano", "Sem lactose"],
    kcal: 440,
    protein: 22,
    carbs: 52,
    fat: 15,
    weight: 400,
  },
];

for (const meal of mockProducts) {
  meal.active = true;
  meal.ingredients = [meal.description];
  meal.allergens = "Informação não cadastrada. Consulte a equipe antes de consumir.";
  meal.addOns = [
    {
      id: "legumes",
      name: "Porção extra de legumes (dados nutricionais não cadastrados)",
      price: 4,
    },
  ];
}
