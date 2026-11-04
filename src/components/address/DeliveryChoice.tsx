import { useCart } from "@/lib/cart";
import { availableDates } from "@/services/delivery";
import { brl } from "@/lib/menu";
export function DeliveryChoice() {
  const store = useCart();
  const dates = availableDates(store.deliverySlots);
  return (
    <section className="space-y-3">
      <h2>Entrega simulada</h2>
      {!store.selectedAddress ? (
        <p>Selecione um endereço para consultar a região e a taxa de entrega.</p>
      ) : store.zone ? (
        <p className="rounded-xl bg-primary-soft p-3 text-primary-strong">
          Frete: {brl(store.zone.fee)} • {store.zone.estimate}
        </p>
      ) : (
        <p role="alert" className="rounded-xl border border-destructive p-3">
          Esta região ainda não está cadastrada para entrega. Consulte nossa equipe pelo WhatsApp.
          <a
            className="mt-3 inline-flex min-h-11 items-center underline"
            href={`https://wa.me/${store.settings.whatsapp}?text=${encodeURIComponent("Olá! Gostaria de consultar atendimento para " + (store.selectedAddress?.neighborhood ?? "") + ", " + (store.selectedAddress?.city ?? ""))}`}
            target="_blank"
            rel="noreferrer"
          >
            Consultar região no WhatsApp
          </a>
        </p>
      )}
      <label>
        Data desejada de entrega
        <select
          value={`${store.wizard.deliveryDate}|${store.wizard.slotId}`}
          onChange={(e) => {
            const [deliveryDate = "", slotId = ""] = e.target.value.split("|");
            store.update((s) => ({ ...s, wizard: { ...s.wizard, deliveryDate, slotId } }));
          }}
        >
          <option value="|">Selecionar uma data disponível</option>
          {dates.map((d) => (
            <option key={`${d.date}-${d.slot.id}`} value={`${d.date}|${d.slot.id}`}>
              {d.date.split("-").reverse().join("/")} • {d.slot.label}
            </option>
          ))}
        </select>
      </label>
      {!dates.length && <p role="alert">Não há datas ativas. Consulte a equipe.</p>}
      <p className="text-xs text-muted-foreground">
        Disponibilidade demonstrativa. Encontrar um CEP não garante atendimento.
      </p>
    </section>
  );
}
