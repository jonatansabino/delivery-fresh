import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { QtyStepper } from "@/components/MealCard";
import { brl, getMeal } from "@/lib/menu";

export const Route = createFileRoute("/produto/$id")({
  loader: ({ params }) => {
    const meal = getMeal(params.id);
    if (!meal) throw notFound();
    return { meal };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.meal.name} — FreshBites Fit` : "Marmita — FreshBites Fit" },
      { name: "description", content: loaderData?.meal.description ?? "Marmita saudável FreshBites Fit." },
      { property: "og:title", content: loaderData?.meal.name ?? "FreshBites Fit" },
      { property: "og:description", content: loaderData?.meal.description ?? "Marmita saudável." },
    ],
  }),
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <p>Marmita não encontrada.</p>
      <Link to="/cardapio" className="mt-4 inline-block font-bold text-primary">Voltar ao cardápio</Link>
    </div>
  ),
  component: Produto,
});

function Produto() {
  const { meal } = Route.useLoaderData();
  const router = useRouter();
  return (
    <div className="md:grid md:grid-cols-2 md:gap-8 md:p-6">
      <div className="relative">
        <img src={meal.image} alt={meal.name} width={944} height={704} className="aspect-[4/3] w-full object-cover md:rounded-3xl" />
        <button onClick={() => router.history.back()} aria-label="Voltar" className="absolute left-4 top-4 grid size-11 place-items-center rounded-full bg-card shadow-card">
          <ArrowLeft className="size-5" />
        </button>
      </div>
      <div className="-mt-6 rounded-t-3xl bg-background p-5 relative md:mt-0">
        <span className="text-xs font-bold uppercase tracking-wide text-primary">{meal.category}</span>
        <h1 className="mt-1 text-2xl font-extrabold">{meal.name}</h1>
        <p className="mt-2 text-muted-foreground">{meal.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {meal.tags.map((t) => <span key={t} className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-strong">{t}</span>)}
        </div>
        <h2 className="mt-6 font-bold">Informação nutricional · {meal.weight}g</h2>
        <dl className="mt-2 grid grid-cols-4 gap-2">
          {[["Calorias", `${meal.kcal}`], ["Proteína", `${meal.protein}g`], ["Carbo", `${meal.carbs}g`], ["Gordura", `${meal.fat}g`]].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-card p-3 text-center shadow-card">
              <dd className="text-lg font-extrabold">{v}</dd>
              <dt className="text-xs text-muted-foreground">{k}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-muted-foreground">Conservar refrigerado por até 7 dias ou congelado por até 30 dias. Aquecer 3 min no micro-ondas.</p>
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-card p-4 shadow-card">
          <span className="text-2xl font-extrabold text-primary-strong">{brl(meal.price)}</span>
          <QtyStepper id={meal.id} onAdd={() => toast.success("Adicionado ao carrinho")} />
        </div>
      </div>
    </div>
  );
}
