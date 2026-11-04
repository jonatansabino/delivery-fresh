import { useState } from "react";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/menu";
export default function Economia() {
  const store = useCart();
  const [spend, setSpend] = useState(35);
  const [planId, setPlanId] = useState(store.plans.find((p) => p.active !== false)?.id ?? "");
  const [qty, setQty] = useState(5);
  const plan = store.plans.find((p) => p.id === planId && p.active !== false);
  const cost = plan ? Math.ceil(qty / plan.meals) * plan.meals * plan.pricePerMeal : 0;
  const delivery = store.zone?.fee ?? store.settings.deliveryFee;
  const difference = spend * qty - cost - delivery;
  if (!plan)
    return (
      <section className="page space-y-4">
        <h1>Simulador de economia</h1>
        <p>
          Nenhum plano ativo para comparar. Consulte a loja ou ative um plano no Admin
          demonstrativo.
        </p>
      </section>
    );
  return (
    <section className="page space-y-5">
      <h1>Simulador de economia</h1>
      <p>
        Simulação de custos, sem promessa de economia. Considera planos completos; unidades
        excedentes podem ser consumidas em outra semana.
      </p>
      <label>
        Gasto médio em delivery por refeição (R$)
        <input
          type="number"
          min="0"
          max="1000"
          step="0.5"
          value={spend}
          onChange={(e) => setSpend(Math.max(0, Math.min(1000, Number(e.target.value))))}
        />
      </label>
      <label>
        Refeições por semana
        <input
          type="number"
          min="1"
          max="50"
          value={qty}
          onChange={(e) => setQty(Math.max(1, Math.min(50, Math.floor(Number(e.target.value)))))}
        />
      </label>
      <label>
        Plano comparado
        <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
          {store.plans
            .filter((p) => p.active !== false)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.meals} marmitas)
              </option>
            ))}
        </select>
      </label>
      <dl className="panel space-y-3">
        <div className="flex justify-between">
          <dt>Delivery estimado</dt>
          <dd>{brl(spend * qty)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Plano(s) completo(s)</dt>
          <dd>{brl(cost)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Uma entrega simulada</dt>
          <dd>{brl(delivery)}</dd>
        </div>
        <div className="border-t pt-3 font-bold">
          <dt>
            {difference >= 0
              ? "Diferença estimada a favor do plano"
              : "Custo adicional estimado do plano"}
          </dt>
          <dd>{brl(Math.abs(difference))}</dd>
        </div>
      </dl>
      <p className="text-sm text-muted-foreground">
        Frete do delivery tradicional deve estar incluído no gasto médio informado. O plano
        considera uma entrega; adicionais e cupons não entram na comparação.
      </p>
    </section>
  );
}
