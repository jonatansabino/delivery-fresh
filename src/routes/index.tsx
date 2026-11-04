import { useCart } from "@/lib/cart";
import { Link, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { ArrowRight, Leaf, Snowflake, Truck, Search } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Logo } from "@/components/AppShell";
import { MealCard } from "@/components/MealCard";
import { CATEGORIES, brl } from "@/lib/menu";

export default function Index() {
  const store = useCart();
  const { meals, plans, categories } = store;
  const MEALS = meals.filter((m) => m.active !== false);
  const PLANS = plans.filter((p) => p.active !== false);
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-4 pt-4 md:hidden">
        <Logo />
      </div>

      <div className="flex items-center justify-between gap-3 px-4 md:px-6">
        <Link className="min-w-0 text-sm text-muted-foreground" to="/perfil">
          Entrega:{" "}
          <span className="font-semibold text-foreground">
            {store.selectedAddress
              ? `${store.selectedAddress.label || "Endereço"} • ${store.selectedAddress.neighborhood}`
              : "Selecionar endereço"}
          </span>
        </Link>
        <Link
          className="btn-secondary shrink-0"
          to="/carrinho"
          aria-label={`Carrinho com ${store.count} itens`}
        >
          Sacola ({store.count})
        </Link>
      </div>
      <section className="px-4 md:px-6 md:pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-hero text-primary-foreground md:grid md:grid-cols-2">
          <div className="relative z-10 p-6 md:p-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
              <Leaf className="size-3" /> Feito fresco toda semana
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">
              Sua semana saudável garantida na geladeira, sem sujar uma panela.
            </h1>
            <p className="mt-3 text-sm opacity-85 md:text-base">
              Comida saudável, prática e deliciosa. Do nosso cuidado para sua mesa.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/montar-plano"
                onClick={() => store.update((s) => ({ ...s, wizard: { ...s.wizard, step: 1 } }))}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 font-bold text-accent-foreground hover:bg-accent-strong"
              >
                Montar meu plano semanal <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/cardapio"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary-foreground/15 px-6 font-bold hover:bg-primary-foreground/25"
              >
                Ver cardápio
              </Link>
            </div>
          </div>
          <img
            src={hero}
            alt="Marmitas fit com frango, arroz integral e legumes"
            width={1280}
            height={832}
            className="h-48 w-full object-cover md:h-full"
          />
        </div>
      </section>

      <section className="px-4 md:px-6">
        <Link
          to="/cardapio"
          className="flex h-12 items-center gap-3 rounded-2xl border bg-card px-4 text-muted-foreground"
        >
          <Search className="size-4" /> Buscar marmitas
        </Link>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {categories
            .filter((c) => c.active)
            .map(({ name: c }) => (
              <Link
                key={c}
                to={`/cardapio?c=${encodeURIComponent(c)}`}
                className="shrink-0 rounded-full bg-primary-soft px-4 py-2 text-sm font-semibold text-primary-strong"
              >
                {c}
              </Link>
            ))}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2 px-4 md:px-6">
        {[
          { i: Snowflake, t: "Dura 7 dias", d: "na geladeira" },
          { i: Truck, t: "Entrega", d: "semanal" },
          { i: Leaf, t: "Sem", d: "conservantes" },
        ].map(({ i: I, t, d }) => (
          <div key={t} className="rounded-2xl bg-card p-3 text-center shadow-card">
            <I className="mx-auto size-5 text-primary" />
            <p className="mt-1 text-sm font-bold">{t}</p>
            <p className="text-xs text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>

      <section className="px-4 md:px-6">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl font-extrabold">Planos semanais</h2>
          <Link to="/planos" className="text-sm font-semibold text-primary">
            Ver todos
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {PLANS.map((p) => (
            <Link
              key={p.id}
              to="/planos"
              className={`rounded-2xl border-2 bg-card p-4 ${p.popular ? "border-primary" : "border-transparent"} shadow-card`}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold">{p.name}</p>
                {p.popular && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                    Mais popular
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {p.meals} marmitas · {brl(p.pricePerMeal)} cada
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 md:px-6">
        <h2 className="mb-3 text-xl font-extrabold">Mais pedidas da semana</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MEALS.slice(0, 3).map((m) => (
            <MealCard key={m.id} meal={m} />
          ))}
        </div>
      </section>
      <section className="px-4 md:px-6 space-y-3">
        <h2 className="text-xl font-extrabold">Como funciona</h2>
        <ol className="grid gap-3 md:grid-cols-3">
          {[
            "Escolha suas marmitas ou monte um plano.",
            "Organize a semana e consulte a entrega pelo CEP.",
            "Salve localmente, envie pelo WhatsApp e aguarde a equipe.",
          ].map((text, i) => (
            <li key={text} className="panel">
              <span className="font-extrabold text-primary-strong">0{i + 1}</span>
              <p className="mt-2 text-sm">{text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="px-4 md:px-6">
        <div className="rounded-3xl bg-primary-soft p-5">
          <h2 className="text-xl font-extrabold">Seu cuidado rende mais</h2>
          <p className="mt-2 text-sm">
            Cupons e FreshPoints demonstrativos. Experimente FIT10 e compare os custos da sua
            semana.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="btn-secondary" to="/freshpoints">
              Ver FreshPoints
            </Link>
            <Link className="btn-secondary" to="/economia">
              Simular economia
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
