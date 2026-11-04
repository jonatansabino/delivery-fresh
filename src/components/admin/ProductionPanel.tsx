import { useState } from "react";
import { useCart } from "@/lib/cart";
export function ProductionPanel() {
  const store = useCart();
  const eligible = store.orders.filter((o) => !["cancelado", "entregue"].includes(o.status));
  const [selected, setSelected] = useState<string[]>([]);
  const chosen = eligible.filter((o) => new Set(selected).has(o.id));
  const rows = new Map<string, { name: string; needed: number; prepared: number }>();
  for (const o of chosen)
    for (const i of o.items) {
      const prev = rows.get(i.mealId) ?? { name: i.name, needed: 0, prepared: 0 };
      rows.set(i.mealId, {
        name: prev.name,
        needed: prev.needed + i.qty,
        prepared: prev.prepared + Math.min(i.qty, store.production[`${o.id}:${i.mealId}`] ?? 0),
      });
    }
  return (
    <section className="space-y-4">
      <h2>Produção simulada</h2>
      <p>
        Selecione pedidos únicos. Quantidades preparadas são guardadas por pedido e produto,
        evitando duplicação ao mudar a seleção.
      </p>
      <button
        className="btn-secondary"
        onClick={() => setSelected(selected.length ? [] : eligible.map((o) => o.id))}
      >
        {selected.length ? "Desmarcar todos" : "Selecionar todos"}
      </button>
      <div className="space-y-2">
        {eligible.map((o) => (
          <label className="panel flex! items-center gap-3" key={o.id}>
            <input
              type="checkbox"
              className="checkbox"
              checked={selected.includes(o.id)}
              onChange={() =>
                setSelected((ids) =>
                  ids.includes(o.id) ? ids.filter((id) => id !== o.id) : [...ids, o.id],
                )
              }
            />
            <span>
              {o.name} • #{o.id.slice(0, 8)} • {o.deliveryDate}
            </span>
          </label>
        ))}
      </div>
      {!eligible.length && <p>Sem pedidos pendentes de produção.</p>}
      {!chosen.length && <p>Selecione pedidos para consolidar as quantidades.</p>}
      {[...rows].map(([mealId, row]) => (
        <article className="panel space-y-3" key={mealId}>
          <h3 className="font-bold">{row.name}</h3>
          <dl className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <dt>Necessária</dt>
              <dd className="font-bold">{row.needed}</dd>
            </div>
            <div>
              <dt>Preparada</dt>
              <dd className="font-bold">{row.prepared}</dd>
            </div>
            <div>
              <dt>Pendente</dt>
              <dd className="font-bold">{row.needed - row.prepared}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-secondary"
              disabled={row.prepared >= row.needed}
              onClick={() =>
                store.update((s) => {
                  const production = { ...s.production };
                  const target = chosen.find((o) => {
                    const item = o.items.find((i) => i.mealId === mealId);
                    return item && (production[`${o.id}:${mealId}`] ?? 0) < item.qty;
                  });
                  if (target) {
                    const key = `${target.id}:${mealId}`;
                    production[key] = (production[key] ?? 0) + 1;
                  }
                  return { ...s, production };
                })
              }
            >
              Preparar +1
            </button>
            <button
              className="btn-secondary"
              disabled={!row.prepared}
              onClick={() =>
                store.update((s) => {
                  const production = { ...s.production };
                  const target = chosen.find((o) => (production[`${o.id}:${mealId}`] ?? 0) > 0);
                  if (target) {
                    const key = `${target.id}:${mealId}`;
                    production[key] = Math.max(0, (production[key] ?? 0) - 1);
                  }
                  return { ...s, production };
                })
              }
            >
              Corrigir −1
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
