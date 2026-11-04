import { ProductExtras } from "@/components/ProductExtras";
import { useCart } from "@/lib/cart";
import { Link, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { QtyStepper } from "@/components/MealCard";
import { brl } from "@/lib/menu";

export default function Produto() {
  const { getMeal } = useCart();
  const { id } = useParams();
  const navigate = useNavigate();
  const meal = getMeal(id ?? "");
  if (!meal)
    return (
      <div className="p-8">
        Marmita não encontrada. <Link to="/cardapio">Ver cardápio</Link>
      </div>
    );
  return (
    <div className="md:grid md:grid-cols-2 md:gap-8 md:p-6">
      <div className="relative">
        <img
          src={meal.image}
          alt={meal.name}
          width={944}
          height={704}
          className="aspect-[4/3] w-full object-cover md:rounded-3xl"
        />
        <button
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="absolute left-4 top-4 grid size-11 place-items-center rounded-full bg-card shadow-card"
        >
          <ArrowLeft className="size-5" />
        </button>
      </div>
      <div className="-mt-6 rounded-t-3xl bg-background p-5 relative md:mt-0">
        <span className="text-xs font-bold uppercase tracking-wide text-primary">
          {meal.category}
        </span>
        <h1 className="mt-1 text-2xl font-extrabold">{meal.name}</h1>
        <p className="mt-2 text-muted-foreground">{meal.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {meal.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-strong"
            >
              {t}
            </span>
          ))}
        </div>
        <h2 className="mt-6 font-bold">Informação nutricional · {meal.weight}g</h2>
        <dl className="mt-2 grid grid-cols-4 gap-2">
          {[
            ["Calorias", meal.kcal === null ? "N/I" : `${meal.kcal}`],
            ["Proteína", meal.protein === null ? "N/I" : `${meal.protein}g`],
            ["Carbo", meal.carbs === null ? "N/I" : `${meal.carbs}g`],
            ["Gordura", meal.fat === null ? "N/I" : `${meal.fat}g`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-card p-3 text-center shadow-card">
              <dd className="text-lg font-extrabold">{v}</dd>
              <dt className="text-xs text-muted-foreground">{k}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-muted-foreground">
          Conservar refrigerado por até 7 dias ou congelado por até 30 dias. Aquecer 3 min no
          micro-ondas.
        </p>
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-card p-4 shadow-card">
          <span className="text-2xl font-extrabold text-primary-strong">{brl(meal.price)}</span>
          <QtyStepper id={meal.id} onAdd={() => toast.success("Adicionado ao carrinho")} />
        </div>
        <ProductExtras meal={meal} />
      </div>
    </div>
  );
}
