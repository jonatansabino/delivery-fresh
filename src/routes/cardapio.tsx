import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { MealCard } from "@/components/MealCard";
import { CATEGORIES, MEALS, type Category } from "@/lib/menu";
import { useCart } from "@/lib/cart";
import { getPlan } from "@/lib/menu";

export const Route = createFileRoute("/cardapio")({
  validateSearch: (s: Record<string, unknown>): { c?: Category } =>
    CATEGORIES.includes(s.c as Category) ? { c: s.c as Category } : {},
  head: () => ({
    meta: [
      { title: "Cardápio da semana — FreshBites Fit" },
      { name: "description", content: "Marmitas fit com informação nutricional completa: frango, carne, peixe, vegano e low carb." },
      { property: "og:title", content: "Cardápio da semana — FreshBites Fit" },
      { property: "og:description", content: "Escolha suas marmitas saudáveis da semana." },
    ],
  }),
  component: Cardapio,
});

function Cardapio() {
  const { c } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState("");
  const { planId, count } = useCart();
  const plan = planId ? getPlan(planId) : undefined;
  const list = MEALS.filter((m) => (!c || m.category === c) && m.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="px-4 pt-4 md:px-6 md:pt-8">
      <h1 className="text-2xl font-extrabold">Cardápio da semana</h1>
      {plan && (
        <div className="mt-3 rounded-2xl bg-primary-soft p-3 text-sm font-semibold text-primary-strong">
          Plano {plan.name}: {Math.min(count, plan.meals)} de {plan.meals} marmitas selecionadas
        </div>
      )}
      <label className="mt-4 flex h-12 items-center gap-3 rounded-2xl border bg-card px-4">
        <Search className="size-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar marmitas" aria-label="Buscar marmitas" className="w-full bg-transparent outline-none placeholder:text-muted-foreground" />
      </label>
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
        {[undefined, ...CATEGORIES].map((cat) => (
          <button
            key={cat ?? "all"}
            onClick={() => navigate({ search: cat ? { c: cat } : {} })}
            className={`h-10 shrink-0 rounded-full px-4 text-sm font-semibold ${c === cat ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border"}`}
          >
            {cat ?? "Todas"}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((m) => <MealCard key={m.id} meal={m} />)}
      </div>
      {list.length === 0 && <p className="py-16 text-center text-muted-foreground">Nenhuma marmita encontrada.</p>}
    </div>
  );
}
