import { useState } from "react";
import { useCart } from "@/lib/cart";
import { days } from "@/types/models";
import { NutritionSummary } from "./NutritionSummary";
export function MealPlanner({ editing = true }: { editing?: boolean }) {
  const store = useCart();
  const [day, setDay] = useState(-1);
  const selected = day < 0 ? store.planner : store.planner.filter((p) => p.day === day);
  const remaining = Object.entries(store.items)
    .map(([id, qty]) => ({ id, qty: qty - store.planner.filter((p) => p.mealId === id).length }))
    .filter((v) => v.qty > 0);
  return (
    <section className="space-y-4">
      <h2>Calendário de consumo</h2>
      <p className="text-sm text-muted-foreground">
        Organização pessoal das refeições. Os dias abaixo não representam datas de entrega.
      </p>
      {editing && (
        <>
          <p className="font-semibold">
            {store.planner.length} de {store.count} marmitas organizadas
          </p>
          <button
            type="button"
            className="btn-secondary"
            disabled={!store.count}
            onClick={() =>
              store.update((s) => ({
                ...s,
                planner: Object.entries(s.items).flatMap(([mealId, qty]) =>
                  Array.from({ length: qty }, (_, i) => ({
                    id: crypto.randomUUID(),
                    mealId,
                    day: i % 7,
                  })),
                ),
              }))
            }
          >
            Distribuir automaticamente
          </button>
          {remaining.map((r) => (
            <div key={r.id} className="panel space-y-2">
              <p>
                {store.getMeal(r.id)?.name} • {r.qty} para organizar
              </p>
              <label>
                Adicionar uma unidade no dia
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value !== "")
                      store.update((s) => ({
                        ...s,
                        planner: [
                          ...s.planner,
                          { id: crypto.randomUUID(), mealId: r.id, day: Number(e.target.value) },
                        ],
                      }));
                  }}
                >
                  <option value="">Escolha o dia</option>
                  {days.map((d, i) => (
                    <option key={d} value={i}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </>
      )}
      <label>
        Resumo nutricional
        <select value={day} onChange={(e) => setDay(Number(e.target.value))}>
          <option value={-1}>Semana completa</option>
          {days.map((d, i) => (
            <option key={d} value={i}>
              {d}
            </option>
          ))}
        </select>
      </label>
      <NutritionSummary entries={selected} meals={store.meals} />
      <div className="grid gap-3 md:grid-cols-2">
        {days.map((d, i) => (
          <article className="panel space-y-3" key={d}>
            <h3 className="font-bold">{d}</h3>
            {!store.planner.some((p) => p.day === i) && (
              <p className="text-sm text-muted-foreground">Sem refeições planejadas.</p>
            )}
            {store.planner
              .filter((p) => p.day === i)
              .map((p) => (
                <div key={p.id} className="space-y-2 border-t pt-2">
                  <p className="text-sm">
                    {store.getMeal(p.mealId)?.name ?? "Produto não cadastrado"}
                  </p>
                  {editing && (
                    <div className="flex flex-wrap items-end gap-2">
                      <label className="flex-1">
                        Mover para
                        <select
                          aria-label={`Mover ${store.getMeal(p.mealId)?.name} de ${d}`}
                          value={p.day}
                          onChange={(e) =>
                            store.update((s) => ({
                              ...s,
                              planner: s.planner.map((v) =>
                                v.id === p.id ? { ...v, day: Number(e.target.value) } : v,
                              ),
                            }))
                          }
                        >
                          {days.map((name, n) => (
                            <option key={name} value={n}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        className="btn-secondary"
                        type="button"
                        aria-label={`Remover refeição de ${d}`}
                        onClick={() =>
                          store.update((s) => ({
                            ...s,
                            planner: s.planner.filter((v) => v.id !== p.id),
                          }))
                        }
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </article>
        ))}
      </div>
    </section>
  );
}
