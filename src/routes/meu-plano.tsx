import { Link } from "react-router-dom";
import { useCart } from "@/lib/cart";
import { MealPlanner } from "@/components/planner/MealPlanner";
export default function MeuPlano() {
  const store = useCart();
  const last = store.orders.find(
    (o) => o.planId && !o.id.startsWith("DEMO-") && o.status !== "cancelado",
  );
  return (
    <section className="page max-w-4xl! space-y-5">
      <h1>Meu plano e minha semana</h1>
      {last && (
        <p className="panel">
          Último plano solicitado: <strong>{last.planName}</strong>. Consulte o status em Pedidos.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Link
          className="btn"
          to="/montar-plano"
          onClick={() => {
            if (!store.planId) store.update((s) => ({ ...s, wizard: { ...s.wizard, step: 1 } }));
          }}
        >
          {store.planId ? "Continuar montagem" : "Montar meu plano"}
        </Link>
        <Link className="btn-secondary" to="/planos">
          Conhecer planos
        </Link>
      </div>
      {!store.planner.length && !store.count && (
        <p>
          Nenhuma refeição planejada. Monte um plano ou adicione marmitas ao carrinho para organizar
          a semana.
        </p>
      )}
      <MealPlanner editing={store.count > 0} />
    </section>
  );
}
