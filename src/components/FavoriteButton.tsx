import { Heart } from "lucide-react";
import { useCart } from "@/lib/cart";
export function FavoriteButton({ id }: { id: string }) {
  const store = useCart();
  const active = store.favorites.includes(id);
  return (
    <button
      type="button"
      aria-label={`${active ? "Remover dos favoritos" : "Favoritar"} ${store.getMeal(id)?.name ?? "marmita"}`}
      aria-pressed={active}
      onClick={() => store.toggleFavorite(id)}
      className="grid size-11 shrink-0 place-items-center rounded-full border bg-card text-primary-strong"
    >
      <Heart className={`size-5 ${active ? "fill-current" : ""}`} />
    </button>
  );
}
