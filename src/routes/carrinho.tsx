import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag, X } from "lucide-react";
import { QtyStepper } from "@/components/MealCard";
import { useCart } from "@/lib/cart";
import { brl, getMeal, getPlan } from "@/lib/menu";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho — FreshBites Fit" },
      { name: "description", content: "Revise suas marmitas antes de finalizar o pedido." },
      { property: "og:title", content: "Carrinho — FreshBites Fit" },
      { property: "og:description", content: "Revise seu pedido." },
    ],
  }),
  component: Carrinho,
});

export function PriceSummary() {
  const { subtotal, delivery, total } = useCart();
  return (
    <dl className="space-y-2 rounded-2xl bg-card p-4 text-sm shadow-card">
      <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{brl(subtotal)}</dd></div>
      <div className="flex justify-between"><dt className="text-muted-foreground">Entrega</dt><dd>{brl(delivery)}</dd></div>
      <div className="flex justify-between border-t pt-2 text-base font-extrabold"><dt>Total</dt><dd>{brl(total)}</dd></div>
    </dl>
  );
}

function Carrinho() {
  const { items, planId, count, setPlan } = useCart();
  const plan = planId ? getPlan(planId) : undefined;
  const planIncomplete = plan && count !== plan.meals;

  if (count === 0)
    return (
      <div className="px-6 py-20 text-center">
        <ShoppingBag className="mx-auto size-12 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-extrabold">Seu carrinho está vazio</h1>
        <p className="mt-1 text-muted-foreground">Que tal escolher as marmitas da semana?</p>
        <Link to="/cardapio" className="mt-6 inline-flex h-12 items-center rounded-full bg-primary px-6 font-bold text-primary-foreground">Ver cardápio</Link>
      </div>
    );

  return (
    <div className="px-4 pt-4 md:mx-auto md:max-w-xl md:pt-8">
      <h1 className="text-2xl font-extrabold">Carrinho</h1>
      {plan && (
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-primary-soft p-3 text-sm text-primary-strong">
          <span className="font-semibold">Plano {plan.name} · {count} de {plan.meals} marmitas</span>
          <button onClick={() => setPlan(undefined)} aria-label="Remover plano" className="grid size-9 place-items-center"><X className="size-4" /></button>
        </div>
      )}
      <ul className="mt-4 space-y-3">
        {Object.entries(items).map(([id]) => {
          const m = getMeal(id)!;
          return (
            <li key={id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
              <img src={m.image} alt="" width={64} height={64} className="size-16 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{m.name}</p>
                {!plan && <p className="text-sm text-primary-strong">{brl(m.price)}</p>}
              </div>
              <QtyStepper id={id} />
            </li>
          );
        })}
      </ul>
      <div className="mt-5"><PriceSummary /></div>
      {planIncomplete && (
        <p className="mt-3 text-center text-sm font-semibold text-accent-strong">
          {count < plan.meals ? `Escolha mais ${plan.meals - count} marmita(s) para completar o plano.` : `Remova ${count - plan.meals} marmita(s) para fechar o plano.`}
        </p>
      )}
      {planIncomplete ? (
        <Link to="/cardapio" className="mt-4 flex h-14 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">Continuar escolhendo</Link>
      ) : (
        <Link to="/checkout" className="mt-4 flex h-14 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground hover:bg-accent-strong">Finalizar pedido</Link>
      )}
    </div>
  );
}
