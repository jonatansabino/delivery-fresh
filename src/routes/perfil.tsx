import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, MapPin, MessageCircle, Salad, User } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/menu";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — FreshBites Fit" },
      { name: "description", content: "Seus dados, endereços e preferências alimentares." },
      { property: "og:title", content: "Perfil — FreshBites Fit" },
      { property: "og:description", content: "Sua conta FreshBites Fit." },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  return (
    <div className="px-4 pt-4 md:mx-auto md:max-w-xl md:pt-8">
      <div className="flex items-center gap-4">
        <span className="grid size-16 place-items-center rounded-full bg-primary-soft text-primary-strong"><User className="size-7" /></span>
        <div>
          <h1 className="text-xl font-extrabold">Olá!</h1>
          <p className="text-sm text-muted-foreground">Login com conta chega em breve.</p>
        </div>
      </div>
      <ul className="mt-6 divide-y overflow-hidden rounded-2xl bg-card shadow-card">
        {[
          { i: MapPin, l: "Meus endereços", to: "/checkout" as const },
          { i: Salad, l: "Preferências alimentares", to: "/cardapio" as const },
        ].map(({ i: I, l, to }) => (
          <li key={l}><Link to={to} className="flex min-h-14 items-center gap-3 px-4"><I className="size-5 text-primary" /><span className="flex-1 font-semibold">{l}</span><ChevronRight className="size-4 text-muted-foreground" /></Link></li>
        ))}
        <li><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="flex min-h-14 items-center gap-3 px-4"><MessageCircle className="size-5 text-primary" /><span className="flex-1 font-semibold">Falar no WhatsApp</span><ChevronRight className="size-4 text-muted-foreground" /></a></li>
      </ul>
    </div>
  );
}
