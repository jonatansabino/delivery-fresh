import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, Snowflake, Truck, Search } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Logo } from "@/components/AppShell";
import { MealCard } from "@/components/MealCard";
import { CATEGORIES, MEALS, PLANS, brl } from "@/lib/menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FreshBites Fit — Sua semana saudável na geladeira" },
      { name: "description", content: "Marmitas fit preparadas com ingredientes frescos. Escolha seu plano semanal e receba em casa." },
      { property: "og:title", content: "FreshBites Fit — Marmitas saudáveis" },
      { property: "og:description", content: "Marmitas fit e planos semanais entregues em casa." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-4 pt-4 md:hidden">
        <Logo />
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
              <Link to="/planos" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 font-bold text-accent-foreground hover:bg-accent-strong">
                Montar meu plano semanal <ArrowRight className="size-4" />
              </Link>
              <Link to="/cardapio" className="inline-flex h-12 items-center justify-center rounded-full bg-primary-foreground/15 px-6 font-bold hover:bg-primary-foreground/25">
                Ver cardápio
              </Link>
            </div>
          </div>
          <img src={hero} alt="Marmitas fit com frango, arroz integral e legumes" width={1280} height={832} className="h-48 w-full object-cover md:h-full" />
        </div>
      </section>

      <section className="px-4 md:px-6">
        <Link to="/cardapio" className="flex h-12 items-center gap-3 rounded-2xl border bg-card px-4 text-muted-foreground">
          <Search className="size-4" /> Buscar marmitas
        </Link>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {CATEGORIES.map((c) => (
            <Link key={c} to="/cardapio" search={{ c }} className="shrink-0 rounded-full bg-primary-soft px-4 py-2 text-sm font-semibold text-primary-strong">
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
          <Link to="/planos" className="text-sm font-semibold text-primary">Ver todos</Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {PLANS.map((p) => (
            <Link key={p.id} to="/planos" className={`rounded-2xl border-2 bg-card p-4 ${p.popular ? "border-primary" : "border-transparent"} shadow-card`}>
              <div className="flex items-center justify-between">
                <p className="font-bold">{p.name}</p>
                {p.popular && <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">Mais popular</span>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{p.meals} marmitas · {brl(p.pricePerMeal)} cada</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 md:px-6">
        <h2 className="mb-3 text-xl font-extrabold">Mais pedidas da semana</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MEALS.slice(0, 3).map((m) => <MealCard key={m.id} meal={m} />)}
        </div>
      </section>
    </div>
  );
}
