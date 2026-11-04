import { Link } from "react-router-dom";
import { useRef, useState, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart";
import { PriceSummary } from "./carrinho";
import { whatsappMessage, whatsappUrl } from "@/services/whatsapp";
import { AddressBook } from "@/components/address/AddressBook";
import { DeliveryChoice } from "@/components/address/DeliveryChoice";
import type { Order } from "@/data/demo";
export default function Checkout() {
  const cart = useCart();
  const busy = useRef(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [form, setForm] = useState({ name: cart.preferences.name, phone: cart.preferences.phone });
  const plan = cart.getPlan(cart.planId ?? "");
  function submit(e: FormEvent) {
    e.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setError("");
    try {
      const saved = cart.placeOrder({
        ...form,
        name: form.name.trim(),
        phone: form.phone.replace(/\D/g, ""),
        deliveryDate: cart.wizard.deliveryDate,
        slotId: cart.wizard.slotId,
        observations: cart.wizard.observations,
      });
      setOrder(saved);
      window.open(whatsappUrl(saved, cart.settings.whatsapp), "_blank", "noopener,noreferrer");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível finalizar.");
      busy.current = false;
    }
  }
  if (order)
    return (
      <section className="page space-y-4">
        <MessageCircle className="size-12 text-primary" />
        <h1>Pedido salvo neste dispositivo!</h1>
        <p className="break-all text-xs">#{order.id}</p>
        <p>
          Este registro local não é sincronizado com a empresa. Envie a mensagem e aguarde a
          confirmação da equipe. Abrir o WhatsApp não confirma o pedido nem o pagamento.
        </p>
        <a
          className="btn"
          href={whatsappUrl(order, cart.settings.whatsapp)}
          target="_blank"
          rel="noreferrer"
        >
          Abrir WhatsApp novamente
        </a>
        <button
          className="btn-secondary"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(whatsappMessage(order));
              setCopied("Mensagem copiada.");
            } catch {
              setCopied("Não foi possível copiar automaticamente. Selecione o texto abaixo.");
            }
          }}
        >
          Copiar mensagem
        </button>
        <p role="status">{copied}</p>
        <details className="panel">
          <summary>Ver mensagem para copiar</summary>
          <textarea
            aria-label="Mensagem do pedido"
            readOnly
            rows={16}
            value={whatsappMessage(order)}
            onFocus={(e) => e.target.select()}
          />
        </details>
        <Link className="btn-secondary" to="/pedidos">
          Consultar meus pedidos
        </Link>
        <p className="text-sm text-muted-foreground">
          O número da loja é demonstrativo; configure-o no Admin antes do uso real.
        </p>
      </section>
    );
  if (!cart.count)
    return (
      <section className="page">
        <h1>Seu carrinho está vazio</h1>
        <Link className="btn mt-4" to="/cardapio">
          Escolher marmitas
        </Link>
      </section>
    );
  if (plan && cart.count !== plan.meals)
    return (
      <section className="page">
        <h1>Complete seu plano</h1>
        <p>Selecione exatamente {plan.meals} marmitas para continuar.</p>
        <Link className="btn mt-4" to="/cardapio">
          Continuar seleção
        </Link>
      </section>
    );
  return (
    <section className="page space-y-5">
      <Link to="/carrinho">← Voltar ao carrinho</Link>
      <h1>Finalizar pedido</h1>
      <p className="text-muted-foreground">
        Pedido e dados somente neste dispositivo. Pagamento manual a combinar.
      </p>
      <AddressBook checkout />
      <DeliveryChoice />
      <form className="space-y-4" onSubmit={submit}>
        <label>
          Nome completo
          <input
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          WhatsApp
          <input
            required
            type="tel"
            autoComplete="tel"
            maxLength={20}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
        <label>
          Observações
          <textarea
            maxLength={500}
            value={cart.wizard.observations}
            onChange={(e) =>
              cart.update((s) => ({ ...s, wizard: { ...s.wizard, observations: e.target.value } }))
            }
          />
        </label>
        <PriceSummary />
        {cart.couponError && (
          <p role="alert" className="text-destructive">
            {cart.couponError} Remova ou altere o cupom no carrinho.
          </p>
        )}
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        <button
          className="btn w-full"
          type="submit"
          disabled={!cart.zone || !cart.wizard.deliveryDate}
        >
          Salvar pedido e abrir WhatsApp
        </button>
      </form>
    </section>
  );
}
