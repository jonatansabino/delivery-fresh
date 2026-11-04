import { Link } from "@tanstack/react-router";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Meal } from "@/lib/menu";
import { brl } from "@/lib/menu";
import { useCart } from "@/lib/cart";

export function QtyStepper({ id, onAdd }: { id: string; onAdd?: () => void }) {
  const { items, setQty, add } = useCart();
  const q = items[id] ?? 0;
  if (q === 0)
    return (
      <button
        onClick={() => { add(id); onAdd?.(); }}
        className="flex h-11 items-center gap-1 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground active:scale-95"
      >
        <Plus className="size-4" /> Adicionar
      </button>
    );
  return (
    <div className="flex h-11 items-center rounded-full bg-primary-soft text-primary-strong">
      <button aria-label="Diminuir" onClick={() => setQty(id, q - 1)} className="grid size-11 place-items-center"><Minus className="size-4" /></button>
      <span className="w-6 text-center font-bold">{q}</span>
      <button aria-label="Aumentar" onClick={() => add(id)} className="grid size-11 place-items-center"><Plus className="size-4" /></button>
    </div>
  );
}

export function MealCard({ meal }: { meal: Meal }) {
  return (
    <article className="overflow-hidden rounded-3xl bg-card shadow-card">
      <Link to="/produto/$id" params={{ id: meal.id }} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img src={meal.image} alt={meal.name} loading="lazy" width={944} height={704} className="size-full object-cover" />
        </div>
        <div className="px-4 pt-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold leading-snug">{meal.name}</h3>
            <span className="shrink-0 font-extrabold text-primary-strong">{brl(meal.price)}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{meal.description}</p>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-2 px-4 pb-4 pt-3">
        <dl className="grid grid-cols-4 gap-3 text-xs">
          {[["Kcal", meal.kcal], ["Prot", `${meal.protein}g`], ["Carb", `${meal.carbs}g`], ["Gord", `${meal.fat}g`]].map(([k, v]) => (
            <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="font-bold">{v}</dd></div>
          ))}
        </dl>
        <QtyStepper id={meal.id} onAdd={() => toast.success(`${meal.name} adicionado`)} />
      </div>
    </article>
  );
}
