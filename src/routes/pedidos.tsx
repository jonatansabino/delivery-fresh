import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/lib/cart";
import { STATUS } from "@/data/demo";
import { brl } from "@/lib/menu";
import { whatsappUrl } from "@/services/whatsapp";
export default function Pedidos() {
  const store = useCart();
  const navigate = useNavigate();
  const [group, setGroup] = useState("all");
  const mine = store.orders
    .filter((o) => !o.id.startsWith("DEMO-"))
    .filter(
      (o) =>
        group === "all" ||
        (group === "done"
          ? o.status === "entregue"
          : group === "cancelled"
            ? o.status === "cancelado"
            : !["entregue", "cancelado"].includes(o.status)),
    );
  return (
    <section className="page space-y-4">
      <h1>Meus pedidos</h1>
      <p className="text-muted-foreground">
        Histórico deste dispositivo. Acompanhamento demonstrativo, atualizado manualmente no Admin
        local.
      </p>
      <label>
        Filtrar pedidos
        <select value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="all">Todos</option>
          <option value="active">Em andamento</option>
          <option value="done">Concluídos</option>
          <option value="cancelled">Cancelados</option>
        </select>
      </label>
      {!mine.length ? (
        <div className="panel">
          <p>Nenhum pedido nesta lista.</p>
          <Link className="btn mt-4" to="/cardapio">
            Ver cardápio
          </Link>
        </div>
      ) : (
        mine.map((o) => (
          <article key={o.id} className="panel space-y-3">
            <p className="break-all text-xs font-bold">#{o.id}</p>
            <span className="inline-block rounded-full bg-primary-soft px-3 py-2 text-sm font-bold">
              {STATUS[o.status]}
            </span>
            <p className="text-xs">{new Date(o.createdAt).toLocaleString("pt-BR")}</p>
            {o.planName && <h2>Plano {o.planName}</h2>}
            <ul>
              {o.items.map((i) => (
                <li key={i.mealId}>
                  {i.qty}x {i.name}
                  {i.addOns?.length ? ` (+ ${i.addOns.map((a) => a.name).join(", ")})` : ""}
                </li>
              ))}
            </ul>
            <p className="font-extrabold">{brl(o.total)}</p>
            <details>
              <summary className="min-h-11 py-3 cursor-pointer font-semibold">
                Detalhes e acompanhamento demo
              </summary>
              <p>{o.address}</p>
              <p>Entrega solicitada: {o.deliveryDate.split("-").reverse().join("/")}</p>
              <p>Observações: {o.observations || "Nenhuma"}</p>
              <dl className="my-3 space-y-1 text-sm">
                <div>Subtotal: {brl(o.subtotal)}</div>
                <div>Frete: {brl(o.delivery)}</div>
                <div>Desconto: {brl(o.discount)}</div>
              </dl>
              <ol
                aria-label="Histórico de status"
                className="border-l-2 border-primary pl-4 space-y-3"
              >
                {(o.statusHistory ?? [{ status: o.status, date: o.createdAt }]).map((h, i) => (
                  <li key={`${h.date}-${i}`}>
                    <strong className="block text-sm">{STATUS[h.status]}</strong>
                    <time className="text-xs">{new Date(h.date).toLocaleString("pt-BR")}</time>
                  </li>
                ))}
              </ol>
            </details>
            <p className="text-xs">
              Pedido local não sincronizado com a empresa. Pagamento manual, sem confirmação
              automática.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                className="btn-secondary"
                onClick={() => {
                  if (store.repeatOrder(o)) navigate("/carrinho");
                }}
              >
                Repetir pedido
              </button>
              <a
                className="btn-secondary"
                href={whatsappUrl(o, store.settings.whatsapp)}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
