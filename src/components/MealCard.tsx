import { FavoriteButton } from "./FavoriteButton";
import { Link } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Meal } from "@/lib/menu";
import { brl } from "@/lib/menu";
import { useCart } from "@/lib/cart";

export function QtyStepper({ id, onAdd }: { id: string; onAdd?: () => void }) {
  const { items, setQty, add, getMeal } = useCart();
  const available = getMeal(id)?.active !== false;
  const q = items[id] ?? 0;
  if (q === 0)
    return (
      <button
        disabled={!available}
        onClick={() => {
          if (add(id)) onAdd?.();
        }}
        className="flex h-11 items-center gap-1 rounded-full bg-primary-strong px-4 text-sm font-bold text-white active:scale-95"
      >
        <Plus className="size-4" /> {available ? "Adicionar" : "Indisponível"}
      </button>
    );
  return (
    <div className="flex h-11 items-center rounded-full bg-primary-soft text-primary-strong">
      <button
        aria-label="Diminuir"
        onClick={() => setQty(id, q - 1)}
        className="grid size-11 place-items-center"
      >
        <Minus className="size-4" />
      </button>
      <span className="w-6 text-center font-bold">{q}</span>
      <button
        aria-label="Aumentar"
        onClick={() => add(id)}
        className="grid size-11 place-items-center"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function MealCard({ meal }: { meal: Meal }) {
  return (
    <article className="relative overflow-hidden rounded-3xl bg-card shadow-card">
      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton id={meal.id} />
      </div>
      <Link to={`/produto/${meal.id}`} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={meal.image}
            alt={meal.name}
            loading="lazy"
            width={944}
            height={704}
            className="size-full object-cover"
          />
        </div>
        <div className="px-4 pt-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold leading-snug">{meal.name}</h3>
            <span className="shrink-0 font-extrabold text-primary-strong">{brl(meal.price)}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {meal.weight} g • {meal.active === false ? "Indisponível" : "Disponível"}
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{meal.description}</p>
        </div>
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4 pt-3">
        <dl className="grid grid-cols-4 gap-3 text-xs">
          {[
            ["Kcal", meal.kcal ?? "N/I"],
            ["Prot", meal.protein === null ? "N/I" : `${meal.protein}g`],
            ["Carb", meal.carbs === null ? "N/I" : `${meal.carbs}g`],
            ["Gord", meal.fat === null ? "N/I" : `${meal.fat}g`],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-bold">{v}</dd>
            </div>
          ))}
        </dl>
        <QtyStepper id={meal.id} onAdd={() => toast.success(`${meal.name} adicionado`)} />
      </div>
    </article>
  );
}
