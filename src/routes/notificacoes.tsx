import { useCart } from "@/lib/cart";
export default function Notificacoes() {
  const store = useCart();
  return (
    <section className="page space-y-4">
      <h1>Notificações locais</h1>
      <p>Histórico deste dispositivo, sem push remoto ou atualizações operacionais reais.</p>
      <button
        className="btn-secondary"
        onClick={() =>
          store.update((s) => ({
            ...s,
            notifications: s.notifications.map((n) => ({ ...n, read: true })),
          }))
        }
      >
        Marcar todas como lidas
      </button>
      {!store.notifications.length && <p>Nenhuma notificação local.</p>}
      {store.notifications.map((n) => (
        <article key={n.id} className={`panel ${n.read ? "opacity-75" : "border-primary-strong"}`}>
          <p>{n.text}</p>
          <p className="mt-2 text-xs">
            {new Date(n.date).toLocaleString("pt-BR")} • {n.read ? "Lida" : "Não lida"}
          </p>
        </article>
      ))}
    </section>
  );
}
