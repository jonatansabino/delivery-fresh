import { PlanProgress } from "@/components/PlanProgress";
import { useState } from "react";

import { Link, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { ShoppingBag, X } from "lucide-react";
import { QtyStepper } from "@/components/MealCard";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/menu";

export function PriceSummary() {
  const { subtotal, discount, delivery, total, additions, selectedAddress, zone } = useCart();
  return (
    <dl className="space-y-2 rounded-2xl bg-card p-4 text-sm shadow-card">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd>{brl(subtotal)}</dd>
      </div>
      {additions > 0 && (
        <p className="text-xs text-muted-foreground">Inclui {brl(additions)} em adicionais.</p>
      )}
      {!selectedAddress && (
        <p className="text-xs text-muted-foreground">Frete estimado; informe o CEP no checkout.</p>
      )}
      {discount > 0 && (
        <div className="flex justify-between">
          <dt>Desconto</dt>
          <dd>−{brl(discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Entrega {zone ? "simulada" : "estimada"}</dt>
        <dd>{brl(delivery)}</dd>
      </div>
      <div className="flex justify-between border-t pt-2 text-base font-extrabold">
        <dt>Total</dt>
        <dd>{brl(total)}</dd>
      </div>
    </dl>
  );
}

export default function Carrinho() {
  const { getMeal, getPlan } = useCart();
  const { items, planId, count, setPlan, coupon, update, applyCoupon, cartAddOns, setQty } =
    useCart();
  const plan = planId ? getPlan(planId) : undefined;
  const planIncomplete = plan && count !== plan.meals;

  if (count === 0)
    return (
      <div className="px-6 py-20 text-center">
        <ShoppingBag className="mx-auto size-12 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-extrabold">Seu carrinho está vazio</h1>
        <p className="mt-1 text-muted-foreground">Que tal escolher as marmitas da semana?</p>
        <Link
          to="/cardapio"
          className="mt-6 inline-flex h-12 items-center rounded-full bg-primary px-6 font-bold text-primary-foreground"
        >
          Ver cardápio
        </Link>
      </div>
    );

  return (
    <div className="px-4 pt-4 md:mx-auto md:max-w-xl md:pt-8">
      <h1 className="text-2xl font-extrabold">Carrinho</h1>
      {plan && <PlanProgress step={3} />}
      {plan && (
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-primary-soft p-3 text-sm text-primary-strong">
          <span className="font-semibold">
            Plano {plan.name} · {count} de {plan.meals} marmitas
          </span>
          <button
            onClick={() => setPlan(undefined)}
            aria-label="Remover plano"
            className="grid size-9 place-items-center"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
      <ul className="mt-4 space-y-3">
        {Object.entries(items).map(([id]) => {
          const m = getMeal(id)!;
          return (
            <li key={id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
              <img
                src={m.image}
                alt=""
                width={64}
                height={64}
                className="size-16 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <Link className="block truncate font-bold" to={`/produto/${m.id}`}>
                  {m.name}
                </Link>
                {(m.addOns ?? [])
                  .filter((a) => (cartAddOns[id] ?? []).includes(a.id))
                  .map((a) => (
                    <p className="text-xs" key={a.id}>
                      + {a.name} ({brl(a.price)} por unidade)
                    </p>
                  ))}
                {m.active === false && (
                  <p className="text-xs text-destructive">Indisponível — remova para continuar.</p>
                )}
                <button className="min-h-11 text-xs text-destructive" onClick={() => setQty(id, 0)}>
                  Remover item
                </button>
                {!plan && <p className="text-sm text-primary-strong">{brl(m.price)}</p>}
              </div>
              <QtyStepper id={id} />
            </li>
          );
        })}
      </ul>
      <CouponForm coupon={coupon} onApply={applyCoupon} />
      <div className="mt-5">
        <PriceSummary />
      </div>
      {planIncomplete && (
        <p className="mt-3 text-center text-sm font-semibold text-accent-strong">
          {count < plan.meals
            ? `Escolha mais ${plan.meals - count} marmita(s) para completar o plano.`
            : `Remova ${count - plan.meals} marmita(s) para fechar o plano.`}
        </p>
      )}
      {planIncomplete ? (
        <Link
          to="/cardapio"
          className="mt-4 flex h-14 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground"
        >
          Continuar escolhendo
        </Link>
      ) : (
        <Link
          to="/checkout"
          className="sticky bottom-[calc(76px+env(safe-area-inset-bottom))] z-20 mt-4 flex h-14 items-center justify-center rounded-full shadow-float bg-accent font-bold text-accent-foreground hover:bg-accent-strong"
        >
          Finalizar pedido
        </Link>
      )}
    </div>
  );
}

function CouponForm({ coupon, onApply }: { coupon: string; onApply: (code: string) => boolean }) {
  const [code, setCode] = useState(coupon);
  const [error, setError] = useState("");
  return (
    <form
      className="mt-4 space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        const normalized = code.trim().toUpperCase();
        if (onApply(normalized)) setError("");
        else setError("Não foi possível aplicar o cupom. Confira o aviso acima.");
      }}
    >
      <label className="block text-sm font-semibold">
        Cupom promocional
        <div className="mt-2 flex gap-2">
          <input
            aria-label="Cupom promocional"
            className="w-full min-w-0 rounded-xl border bg-card px-3"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="FIT10"
          />
          <button className="btn-secondary">Aplicar</button>
        </div>
      </label>
      {coupon && (
        <p className="text-sm text-primary-strong">
          Cupom {coupon} aplicado. Apague e aplique para remover.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
