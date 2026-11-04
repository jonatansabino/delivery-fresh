import { useState } from "react";
import { normalize } from "@/services/delivery";
import { Link, useNavigate } from "react-router-dom";
import { useCart, notify } from "@/lib/cart";
import { MealCard } from "@/components/MealCard";
import { MealPlanner } from "@/components/planner/MealPlanner";
import { AddressBook } from "@/components/address/AddressBook";
import { DeliveryChoice } from "@/components/address/DeliveryChoice";
import { PriceSummary } from "./carrinho";
import { availableDates, formatAddress } from "@/services/delivery";
import { brl } from "@/lib/menu";
export default function MontarPlano() {
  const store = useCart();
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const step = store.wizard.step;
  const plan = store.getPlan(store.planId ?? "");
  const suggested = (m: (typeof store.meals)[number]) =>
    showAll ||
    store.wizard.preferences.every((p) => {
      const tags = normalize([...m.tags, m.category].join(" "));
      return p === "Vegano"
        ? m.category === "Vegano"
        : p === "Vegetariano"
          ? m.category === "Vegano" || tags.includes("vegetariano")
          : tags.includes(normalize(p === "Rico em Proteínas" ? "Rico em proteína" : p));
    });
  const titles = [
    "Objetivo",
    "Plano",
    "Preferências",
    "Marmitas",
    "Organização semanal",
    "Entrega",
    "Revisão",
    "Finalização",
  ];
  const complete = Boolean(plan && store.count === plan.meals);
  const planned =
    complete &&
    store.planner.length === store.count &&
    Object.entries(store.items).every(
      ([id, qty]) => store.planner.filter((p) => p.mealId === id).length === qty,
    );
  const deliveryReady = Boolean(
    store.zone &&
    availableDates(store.deliverySlots).some(
      (d) => d.date === store.wizard.deliveryDate && d.slot.id === store.wizard.slotId,
    ),
  );
  const canAdvance =
    step === 2
      ? !!plan
      : step === 4
        ? complete
        : step === 5
          ? planned
          : step === 6
            ? deliveryReady
            : true;
  function changeStep(next: number) {
    store.update((s) => ({ ...s, wizard: { ...s.wizard, step: next } }));
  }
  return (
    <section className="page max-w-5xl! space-y-5">
      <div>
        <p className="text-sm font-bold text-primary-strong">PLANO PERSONALIZADO</p>
        <h1>{titles[step - 1]}</h1>
        <p className="text-sm">Etapa {step} de 8</p>
        <progress className="w-full accent-emerald-600" max={8} value={step} />
      </div>
      {step === 1 && (
        <>
          <p>Seu objetivo ajuda a organizar preferências. Não é prescrição alimentar ou médica.</p>
          <label>
            Objetivo
            <select
              value={store.wizard.goal}
              onChange={(e) =>
                store.update((s) => ({ ...s, wizard: { ...s.wizard, goal: e.target.value } }))
              }
            >
              {["Perda de Peso", "Ganho de Massa", "Manutenção"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
        </>
      )}
      {step === 2 && (
        <div className="grid gap-3 md:grid-cols-3">
          {store.plans
            .filter((p) => p.active !== false)
            .map((p) => (
              <button
                key={p.id}
                className={`panel text-left min-h-32 ${plan?.id === p.id ? "border-primary-strong border-2" : ""}`}
                aria-pressed={plan?.id === p.id}
                onClick={() => store.setPlan(p.id)}
              >
                <strong className="block">{p.name}</strong>
                <span className="block text-sm">
                  {p.meals} marmitas • {brl(p.meals * p.pricePerMeal)}
                </span>
                <span className="text-xs">{brl(p.pricePerMeal)} por marmita</span>
              </button>
            ))}
        </div>
      )}
      {step === 3 && (
        <>
          <p>
            Preferências não garantem ausência de alérgenos. Informações sem cadastro devem ser
            confirmadas com a equipe.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Sem Lactose",
              "Sem Glúten",
              "Low Carb",
              "Vegano",
              "Vegetariano",
              "Rico em Proteínas",
            ].map((p) => (
              <label key={p} className="panel flex! items-center gap-3">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={store.wizard.preferences.includes(p)}
                  onChange={() =>
                    store.update((s) => ({
                      ...s,
                      wizard: {
                        ...s.wizard,
                        preferences: s.wizard.preferences.includes(p)
                          ? s.wizard.preferences.filter((v) => v !== p)
                          : [...s.wizard.preferences, p],
                      },
                    }))
                  }
                />
                {p}
              </label>
            ))}
          </div>
        </>
      )}
      {step === 4 && (
        <>
          <p className="font-bold">
            {store.count} de {plan?.meals ?? 0} marmitas selecionadas
          </p>
          <p className="text-sm text-muted-foreground">
            Preferências: {store.wizard.preferences.join(", ") || "Sem restrições selecionadas"}.
            Consulte ingredientes e alérgenos no detalhe; nenhuma restrição é certificada neste
            protótipo.
          </p>
          <label className="flex! items-center gap-3">
            <input
              type="checkbox"
              className="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
            />
            Mostrar todas as marmitas, incluindo fora das preferências
          </label>
          {!store.meals.some((m) => m.active !== false && suggested(m)) && (
            <p>
              Sem sugestões para a combinação de preferências. Você pode revisar as opções ou
              mostrar todas as marmitas.
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {store.meals
              .filter((m) => m.active !== false && suggested(m))
              .map((m) => (
                <MealCard key={m.id} meal={m} />
              ))}
          </div>
        </>
      )}
      {step === 5 && <MealPlanner />}
      {step === 6 && (
        <>
          <AddressBook checkout />
          <DeliveryChoice />
        </>
      )}
      {step === 7 && (
        <>
          <h2>Plano {plan?.name}</h2>
          <p>
            {store.wizard.goal} • {store.wizard.preferences.join(", ") || "Sem preferências"}
          </p>
          <ul className="panel space-y-2">
            {Object.entries(store.items).map(([id, q]) => (
              <li key={id}>
                {q}x {store.getMeal(id)?.name}
              </li>
            ))}
          </ul>
          {store.selectedAddress && <p>{formatAddress(store.selectedAddress)}</p>}
          <p>Entrega: {store.wizard.deliveryDate.split("-").reverse().join("/")}</p>
          <PriceSummary />
          <p>
            Revise os dados. O próximo passo solicita seus contatos e salva o pedido antes de abrir
            o WhatsApp.
          </p>
        </>
      )}
      {step === 8 && (
        <>
          <p>
            Conclua os dados de contato no checkout. O pedido será registrado somente neste
            dispositivo.
          </p>
          <Link className="btn" to="/checkout">
            Ir para finalização
          </Link>
        </>
      )}
      {step === 8 && (
        <button className="btn-secondary" onClick={() => changeStep(1)}>
          Recomeçar montagem
        </button>
      )}
      {step < 8 && (
        <div className="sticky bottom-[calc(76px+env(safe-area-inset-bottom))] z-20 flex gap-3 rounded-2xl border bg-card p-3 shadow-float">
          {step > 1 && (
            <button className="btn-secondary" onClick={() => changeStep(step - 1)}>
              Voltar
            </button>
          )}
          <button
            className="btn flex-1"
            disabled={!canAdvance}
            onClick={() => {
              if (step === 7) {
                if (
                  store.update((s) =>
                    notify({ ...s, wizard: { ...s.wizard, step: 8 } }, "Plano montado e revisado."),
                  )
                )
                  navigate("/checkout");
              } else changeStep(step + 1);
            }}
          >
            Continuar
          </button>
        </div>
      )}
      {!canAdvance && (
        <p role="status" className="text-sm">
          {step === 4
            ? "Selecione a quantidade exata de marmitas."
            : step === 5
              ? "Distribua todas as unidades na semana."
              : step === 6
                ? "Cadastre um endereço atendido e escolha uma data disponível."
                : "Selecione um plano."}
        </p>
      )}
    </section>
  );
}
