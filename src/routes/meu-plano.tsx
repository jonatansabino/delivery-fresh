import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck } from "lucide-react";
import { useCart } from "@/lib/cart";
import { brl, getPlan } from "@/lib/menu";

export const Route = createFileRoute("/meu-plano")({
  head: () => ({
    meta: [
      { title: "Meu plano — FreshBites Fit" },
      { name: "description", content: "Gerencie sua assinatura semanal de marmitas." },
      { property: "og:title", content: "Meu plano — FreshBites Fit" },
      { property: "og:description", content: "Sua assinatura semanal." },
    ],
  }),
  component: MeuPlano,
});

function MeuPlano() {
  const { orders, planId } = useCart();
  const last = orders.find((o) => o.planId);
  const plan = getPlan(last?.planId ?? planId ?? "");
  return (
    <div className="px-4 pt-4 md:mx-auto md:max-w-xl md:pt-8">
      <h1 className="text-2xl font-extrabold">Meu plano</h1>
      {plan ? (
        <div className="mt-4 rounded-3xl bg-hero p-6 text-primary-foreground">
          <p className="text-sm opacity-80">{last ? "Plano contratado" : "Plano em montagem"}</p>
          <p className="mt-1 text-2xl font-extrabold">Plano {plan.name}</p>
          <p className="mt-2">{plan.meals} marmitas/semana · {brl(plan.meals * plan.pricePerMeal)}</p>
          <Link to="/cardapio" className="mt-5 inline-flex h-11 items-center rounded-full bg-accent px-5 font-bold text-accent-foreground">Escolher marmitas</Link>
        </div>
      ) : (
        <div className="py-16 text-center">
          <CalendarCheck className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">Você ainda não tem um plano semanal.</p>
          <Link to="/planos" className="mt-5 inline-flex h-12 items-center rounded-full bg-accent px-6 font-bold text-accent-foreground">Conhecer planos</Link>
        </div>
      )}
    </div>
  );
}
