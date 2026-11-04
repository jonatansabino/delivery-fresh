import { createFileRoute, Link } from "@tanstack/react-router";
import { Receipt } from "lucide-react";
import { useCart } from "@/lib/cart";
import { brl, getMeal, getPlan } from "@/lib/menu";

export const Route = createFileRoute("/pedidos")({
  head: () => ({
    meta: [
      { title: "Meus pedidos — FreshBites Fit" },
      { name: "description", content: "Acompanhe seus pedidos de marmitas." },
      { property: "og:title", content: "Meus pedidos — FreshBites Fit" },
      { property: "og:description", content: "Histórico e status dos pedidos." },
    ],
  }),
  component: Pedidos,
});

const STATUS: Record<string, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  confirmado: "Confirmado",
  em_preparo: "Em preparo",
  a_caminho: "A caminho",
  entregue: "Entregue",
};

function Pedidos() {
  const { orders } = useCart();
  return (
    <div className="px-4 pt-4 md:mx-auto md:max-w-xl md:pt-8">
      <h1 className="text-2xl font-extrabold">Pedidos</h1>
      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <Receipt className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">Você ainda não fez pedidos.</p>
          <Link to="/cardapio" className="mt-5 inline-flex h-12 items-center rounded-full bg-primary px-6 font-bold text-primary-foreground">Fazer primeiro pedido</Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-2xl bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <span className="font-bold">#{o.id}</span>
                <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent-strong">{STATUS[o.status]}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString("pt-BR")} · {o.payment === "pix" ? "PIX" : "WhatsApp"}</p>
              {o.planId && <p className="mt-2 text-sm font-semibold">Plano {getPlan(o.planId)?.name}</p>}
              <p className="mt-1 text-sm text-muted-foreground">{o.items.map((i) => `${i.qty}x ${getMeal(i.mealId)?.name}`).join(", ")}</p>
              <p className="mt-2 font-extrabold text-primary-strong">{brl(o.total)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
