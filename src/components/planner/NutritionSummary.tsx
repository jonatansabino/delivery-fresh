import type { Meal } from "@/lib/menu";
import type { PlannerEntry } from "@/types/models";
export function nutritionTotals(entries: PlannerEntry[], meals: Meal[]) {
  const total = { kcal: 0, protein: 0, carbs: 0, fat: 0, missing: 0 };
  for (const entry of entries) {
    const meal = meals.find((m) => m.id === entry.mealId);
    if (!meal) {
      total.missing++;
      continue;
    }
    for (const key of ["kcal", "protein", "carbs", "fat"] as const) {
      if (meal[key] === null) total.missing++;
      else total[key] += meal[key];
    }
  }
  return total;
}
export function NutritionSummary({ entries, meals }: { entries: PlannerEntry[]; meals: Meal[] }) {
  const total = nutritionTotals(entries, meals);
  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Calorias", `${Math.round(total.kcal)} kcal`],
          ["Proteínas", `${total.protein.toFixed(1)} g`],
          ["Carboidratos", `${total.carbs.toFixed(1)} g`],
          ["Gorduras", `${total.fat.toFixed(1)} g`],
        ].map(([k, v]) => (
          <div className="panel" key={k}>
            <dt className="text-xs text-muted-foreground">{k}</dt>
            <dd className="font-bold">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted-foreground">
        {entries.length} refeição(ões) • Somente valores cadastrados da demonstração.{" "}
        {total.missing > 0 ? "Há dados ausentes: os totais são parciais." : ""} Adicionais sem
        cadastro nutricional não entram nos totais. Não é orientação médica.
      </p>
    </div>
  );
}
