import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PLANS, brl } from "@/lib/menu";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos semanais — FreshBites Fit" },
      { name: "description", content: "Planos de 5, 10 ou 15 marmitas fit por semana a partir de R$ 19 cada." },
      { property: "og:title", content: "Planos semanais — FreshBites Fit" },
      { property: "og:description", content: "Assine e garanta sua semana saudável." },
    ],
  }),
  component: Planos,
});

function Planos() {
  const { setPlan, planId } = useCart();
  const navigate = useNavigate();
  return (
    <div className="px-4 pt-4 md:px-6 md:pt-8">
      <h1 className="text-2xl font-extrabold">Escolha seu plano</h1>
      <p className="mt-1 text-muted-foreground">Depois você escolhe as marmitas da semana.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <article key={p.id} className={`relative rounded-3xl border-2 bg-card p-5 shadow-card ${p.popular ? "border-primary" : "border-transparent"}`}>
            {p.popular && <span className="absolute -top-3 right-5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">Mais popular</span>}
            <h2 className="text-lg font-extrabold">Plano {p.name}</h2>
            <p className="text-sm text-muted-foreground">{p.description}</p>
            <p className="mt-4 text-3xl font-extrabold text-primary-strong">{brl(p.meals * p.pricePerMeal)}<span className="text-sm font-semibold text-muted-foreground">/semana</span></p>
            <ul className="mt-4 space-y-2 text-sm">
              {[`${p.meals} marmitas`, `${brl(p.pricePerMeal)} por marmita`, "Cardápio à sua escolha", "Pause quando quiser"].map((f) => (
                <li key={f} className="flex items-center gap-2"><Check className="size-4 text-primary" /> {f}</li>
              ))}
            </ul>
            <button
              onClick={() => { setPlan(p.id); navigate({ to: "/cardapio" }); }}
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
