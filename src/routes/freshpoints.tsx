import { useCart, notify } from "@/lib/cart";
import { rewards } from "@/data/mockLoyalty";
export default function Freshpoints() {
  const store = useCart();
  const balance = store.loyalty.reduce((n, l) => n + l.points, 0);
  return (
    <section className="page space-y-5">
      <h1>FreshPoints</h1>
      <p>
        Programa local demonstrativo, sem valor comercial. A confirmação manual de um pedido no
        Admin gera 1 ponto por real inteiro, uma única vez. Cancelamentos estornam os pontos desse
        pedido.
      </p>
      <div className="rounded-3xl bg-hero p-6 text-white">
        <p>Saldo demonstrativo</p>
        <p className="text-4xl font-extrabold">{Math.max(0, balance)} pontos</p>
        {balance < 0 && (
          <p className="text-sm">Estornos serão compensados pelos próximos créditos.</p>
        )}
      </div>
      <h2>Recompensas virtuais</h2>
      {rewards.map((r) => (
        <article key={r.id} className="panel space-y-2">
          <h3 className="font-bold">{r.name}</h3>
          <p>{r.points} pontos • sem valor financeiro</p>
          <button
            className="btn-secondary"
            disabled={balance < r.points || store.redeemedRewards.includes(r.id)}
            onClick={() =>
              store.update((s) => {
                if (
                  s.redeemedRewards.includes(r.id) ||
                  s.loyalty.reduce((n, l) => n + l.points, 0) < r.points
                )
                  return s;
                return notify(
                  {
                    ...s,
                    redeemedRewards: [...s.redeemedRewards, r.id],
                    loyalty: [
                      ...s.loyalty,
                      {
                        id: crypto.randomUUID(),
                        points: -r.points,
                        text: `Resgate virtual: ${r.name}`,
                        date: new Date().toISOString(),
                      },
                    ],
                  },
                  "Recompensa virtual resgatada.",
                );
              })
            }
          >
            {store.redeemedRewards.includes(r.id) ? "Resgatada" : "Resgatar selo virtual"}
          </button>
        </article>
      ))}
      <h2>Histórico de pontos</h2>
      {!store.loyalty.length && <p>Nenhuma movimentação local.</p>}
      {[...store.loyalty].reverse().map((l) => (
        <div key={l.id} className="panel">
          <p className="font-bold">
            {l.points > 0 ? "+" : ""}
            {l.points} pontos
          </p>
          <p>{l.text}</p>
          <p className="text-xs">{new Date(l.date).toLocaleString("pt-BR")}</p>
        </div>
      ))}
    </section>
  );
}
