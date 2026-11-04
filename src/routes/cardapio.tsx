import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useState } from "react";
import { MealCard } from "@/components/MealCard";
import { useCart } from "@/lib/cart";
import { normalize } from "@/services/delivery";
export default function Cardapio({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const store = useCart();
  const [search, setSearch] = useSearchParams();
  const c = search.get("c") || "";
  const [q, setQ] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [max, setMax] = useState("");
  const [min, setMin] = useState("");
  const [availability, setAvailability] = useState(favoritesOnly ? "all" : "active");
  const [diet, setDiet] = useState("");
  const [sort, setSort] = useState("popular");
  const popularity = (id: string) =>
    store.orders
      .filter((o) => o.status !== "cancelado")
      .reduce(
        (n, o) => n + o.items.filter((i) => i.mealId === id).reduce((sum, i) => sum + i.qty, 0),
        0,
      );
  const list = store.meals
    .filter(
      (m) =>
        (!favoritesOnly || store.favorites.includes(m.id)) &&
        (!c || m.category === c) &&
        normalize(m.name + " " + m.description).includes(normalize(q)) &&
        normalize((m.ingredients ?? []).join(" ")).includes(normalize(ingredient)) &&
        (!max || m.price <= Number(max)) &&
        (!min || m.price >= Number(min)) &&
        (availability !== "active" || m.active !== false) &&
        (!diet || normalize([...m.tags, m.category].join(" ")).includes(normalize(diet))),
    )
    .sort((a, b) =>
      sort === "price"
        ? a.price - b.price
        : sort === "name"
          ? a.name.localeCompare(b.name)
          : popularity(b.id) - popularity(a.id),
    );
  const plan = store.getPlan(store.planId ?? "");
  return (
    <section className="catalog px-4 pt-4 md:px-6 md:pt-8 space-y-4">
      <h1 className="text-2xl font-extrabold">
        {favoritesOnly ? "Minhas favoritas" : "Cardápio da semana"}
      </h1>
      {plan && (
        <div className="panel">
          <p className="font-bold">
            Plano {plan.name}: {store.count} de {plan.meals} marmitas selecionadas
          </p>
          <Link className="text-sm text-primary-strong underline" to="/montar-plano">
            Abrir montagem guiada
          </Link>
        </div>
      )}
      <label className="flex min-h-12 items-center gap-3 rounded-2xl border bg-card px-4">
        <Search className="size-4 shrink-0" />
        <input
          aria-label="Buscar marmitas"
          placeholder="Buscar marmitas"
          className="w-full min-w-0 bg-transparent py-3 outline-none"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {["", ...store.categories.filter((c) => c.active).map((c) => c.name)].map((cat) => (
          <button
            key={cat}
            aria-pressed={c === cat}
            onClick={() => setSearch(cat ? { c: cat } : {})}
            className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold ${c === cat ? "bg-primary-strong text-white" : "bg-card border"}`}
          >
            {cat || "Todas"}
          </button>
        ))}
      </div>
      <details className="panel">
        <summary className="min-h-8 cursor-pointer font-semibold">Filtros e ordenação</summary>
        <div className="page p-0! mt-3 grid grid-cols-2 gap-3">
          <label>
            Preço mínimo
            <input type="number" min="0" value={min} onChange={(e) => setMin(e.target.value)} />
          </label>
          <label>
            Preço máximo
            <input type="number" min="0" value={max} onChange={(e) => setMax(e.target.value)} />
          </label>
          <label>
            Disponibilidade
            <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
              <option value="active">Disponíveis</option>
              <option value="all">Todos</option>
            </select>
          </label>
          <label>
            Preferência alimentar
            <select value={diet} onChange={(e) => setDiet(e.target.value)}>
              {["", "Vegano", "Low Carb", "Sem lactose", "Sem glúten", "Rico em proteína"].map(
                (v) => (
                  <option key={v} value={v}>
                    {v || "Todas"}
                  </option>
                ),
              )}
            </select>
          </label>
          <label>
            Ingrediente
            <input
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              placeholder="Ex.: frango"
            />
          </label>
          <label>
            Ordenar por
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="popular">Mais populares (demo)</option>
              <option value="price">Menor preço</option>
              <option value="name">Nome</option>
            </select>
          </label>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Preferências baseadas no cadastro demonstrativo, sem certificação de ausência de
          alérgenos.
        </p>
      </details>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((m) => (
          <MealCard key={m.id} meal={m} />
        ))}
      </div>
      {!list.length && (
        <div className="py-12 text-center">
          <p>Nenhuma marmita encontrada.</p>
          {favoritesOnly && (
            <Link className="btn mt-4" to="/cardapio">
              Explorar cardápio
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
