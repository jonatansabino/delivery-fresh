import { useState } from "react";
import { useCart } from "@/lib/cart";
import { STATUS, statuses } from "@/data/demo";
import { normalize } from "@/services/delivery";
export function DeliveryAdmin() {
  const store = useCart();
  const [date, setDate] = useState("");
  const [area, setArea] = useState("");
  const orders = store.orders.filter(
    (o) =>
      o.status !== "cancelado" &&
      (!date || o.deliveryDate === date) &&
      normalize(o.addressDetails?.neighborhood ?? o.address).includes(normalize(area)),
  );
  return (
    <section className="space-y-4">
      <h2>Entregas demonstrativas</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          Dia da entrega
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          Bairro
          <input value={area} onChange={(e) => setArea(e.target.value)} />
        </label>
      </div>
      {!orders.length && <p>Nenhuma entrega para estes filtros.</p>}
      {orders.map((o) => (
        <article className="panel space-y-3" key={o.id}>
          <p className="text-xs break-all">Pedido #{o.id}</p>
          <h3 className="font-bold">{o.name}</h3>
          <p>{o.address}</p>
          <p>{o.deliveryDate.split("-").reverse().join("/")} • a confirmar</p>
          <label>
            Status demonstrativo
            <select
              value={o.status}
              onChange={(e) => {
                const status = statuses.find((s) => s === e.target.value);
                if (status) store.setOrderStatus(o.id, status);
              }}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {STATUS[s]}
                </option>
              ))}
            </select>
          </label>
          <a
            className="btn-secondary"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address)}`}
            target="_blank"
            rel="noreferrer"
          >
            Abrir endereço no mapa
          </a>
        </article>
      ))}
    </section>
  );
}
