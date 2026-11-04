import { useState } from "react";
import { useCart } from "@/lib/cart";
import { brl, type Meal } from "@/lib/menu";
import { FavoriteButton } from "./FavoriteButton";
export function ProductExtras({ meal }: { meal: Meal }) {
  const store = useCart();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  return (
    <section className="space-y-4 mt-5">
      <div className="flex items-center gap-3">
        <FavoriteButton id={meal.id} />
        <p className="text-sm">Salvar como favorita neste dispositivo</p>
      </div>
      <h2>Ingredientes cadastrados</h2>
      <ul className="list-disc pl-5 text-sm">
        {(meal.ingredients?.length ? meal.ingredients : ["Não informado."]).map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
      <p className="panel text-sm">
        <strong>Alérgenos: </strong>
        {meal.allergens || "Não informado. Consulte a equipe."}
      </p>
      <p className="text-xs text-muted-foreground">
        Valores nutricionais e ingredientes são dados demonstrativos cadastrados. Ausência de
        informação não significa ausência de alérgenos.
      </p>
      {!!meal.addOns?.length && (
        <fieldset className="space-y-2">
          <legend className="font-bold">Adicionais por marmita</legend>
          {meal.addOns.map((a) => (
            <label className="flex items-center gap-3 rounded-xl border p-3 text-sm" key={a.id}>
              <input
                className="checkbox"
                type="checkbox"
                checked={(store.cartAddOns[meal.id] ?? []).includes(a.id)}
                onChange={() =>
                  store.update((s) => ({
                    ...s,
                    cartAddOns: {
                      ...s.cartAddOns,
                      [meal.id]: (s.cartAddOns[meal.id] ?? []).includes(a.id)
                        ? (s.cartAddOns[meal.id] ?? []).filter((id) => id !== a.id)
                        : [...(s.cartAddOns[meal.id] ?? []), a.id],
                    },
                  }))
                }
              />
              <span>
                {a.name} • +{brl(a.price)}
              </span>
            </label>
          ))}
          <p className="text-xs text-muted-foreground">
            A seleção será aplicada a todas as unidades deste produto no carrinho.
          </p>
        </fieldset>
      )}
      <h2>Avaliações locais</h2>
      {store.reviews
        .filter((r) => r.mealId === meal.id)
        .map((r) => (
          <article className="panel space-y-1" key={r.id}>
            <p className="font-semibold">
              {"★".repeat(r.rating)} • {r.name}
            </p>
            <p className="text-xs">
              {r.demo ? "Exemplo fictício" : "Avaliação local demonstrativa"} •{" "}
              {new Date(r.date).toLocaleDateString("pt-BR")}
            </p>
            <p>{r.comment}</p>
          </article>
        ))}
      {!store.reviews.some((r) => r.mealId === meal.id) && (
        <p className="text-sm text-muted-foreground">Sem avaliações locais.</p>
      )}
      <form
        className="page p-0! space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (
            store.update((s) => ({
              ...s,
              reviews: [
                ...s.reviews,
                {
                  id: crypto.randomUUID(),
                  mealId: meal.id,
                  name: s.preferences.name || "Visitante demonstrativo",
                  rating,
                  comment: comment.trim(),
                  date: new Date().toISOString(),
                  demo: false,
                },
              ],
            }))
          ) {
            setComment("");
            setMessage("Avaliação salva localmente.");
          }
        }}
      >
        <label>
          Nota
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} de 5
              </option>
            ))}
          </select>
        </label>
        <label>
          Comentário
          <textarea maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} />
        </label>
        <button className="btn-secondary">Salvar avaliação demonstrativa</button>
        <p role="status" className="text-sm">
          {message}
        </p>
      </form>
    </section>
  );
}
