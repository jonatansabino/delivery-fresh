import { PlanProgress } from "@/components/PlanProgress";
import { Link, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import { brl } from "@/lib/menu";
import { useCart } from "@/lib/cart";

export default function Planos() {
  const { plans: PLANS } = useCart();
  const { setPlan, planId } = useCart();
  const navigate = useNavigate();
  return (
    <div className="px-4 pt-4 md:px-6 md:pt-8">
      <h1 className="text-2xl font-extrabold">Escolha seu plano</h1>
      <Link className="btn-secondary mt-3" to="/montar-plano">
        Montagem guiada em 8 etapas
      </Link>
      <PlanProgress step={1} />
      <p className="mt-1 text-muted-foreground">
        1. Escolha o plano → 2. Selecione as marmitas → 3. Revise e envie pelo WhatsApp.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {PLANS.filter((p) => p.active !== false).map((p) => (
          <article
            key={p.id}
            className={`relative rounded-3xl border-2 bg-card p-5 shadow-card ${p.popular ? "border-primary" : "border-transparent"}`}
          >
            {p.popular && (
              <span className="absolute -top-3 right-5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                Mais popular
              </span>
            )}
            <h2 className="text-lg font-extrabold">Plano {p.name}</h2>
            <p className="text-sm text-muted-foreground">{p.description}</p>
            <p className="mt-4 text-3xl font-extrabold text-primary-strong">
              {brl(p.meals * p.pricePerMeal)}
              <span className="text-sm font-semibold text-muted-foreground">/semana</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                `${p.meals} marmitas`,
                `${brl(p.pricePerMeal)} por marmita`,
                "Cardápio à sua escolha",
                "Pedido semanal sem renovação automática",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="size-4 text-primary" /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                setPlan(p.id);
                navigate("/cardapio");
              }}
              className={`mt-5 h-12 w-full rounded-full font-bold ${p.popular ? "bg-accent text-accent-foreground hover:bg-accent-strong" : "bg-primary text-primary-foreground"}`}
            >
              {planId === p.id ? "Plano selecionado" : "Escolher plano"}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
