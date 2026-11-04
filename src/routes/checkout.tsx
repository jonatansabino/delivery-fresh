import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, QrCode } from "lucide-react";
import { useState } from "react";
import { PriceSummary } from "./carrinho";
import { useCart } from "@/lib/cart";
import { WHATSAPP_NUMBER, brl, getMeal, getPlan } from "@/lib/menu";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizar pedido — FreshBites Fit" },
      { name: "description", content: "Informe o endereço e pague com PIX ou pelo WhatsApp." },
      { property: "og:title", content: "Finalizar pedido — FreshBites Fit" },
      { property: "og:description", content: "Finalize seu pedido." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const cart = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<"pix" | "whatsapp">("pix");
  const [error, setError] = useState("");

  if (cart.count === 0)
    return <div className="p-10 text-center"><Link to="/cardapio" className="font-bold text-primary">Carrinho vazio — ver cardápio</Link></div>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || phone.replace(/\D/g, "").length < 10 || address.trim().length < 8) {
      setError("Preencha nome, WhatsApp e endereço completos.");
      return;
    }
    const plan = cart.planId ? getPlan(cart.planId) : undefined;
    const lines = Object.entries(cart.items).map(([id, q]) => `• ${q}x ${getMeal(id)?.name}`);
    const order = cart.placeOrder({ name, address, payment });
    if (payment === "whatsapp") {
      const msg = [`Olá! Pedido #${order.id} — FreshBites Fit`, plan ? `Plano ${plan.name}` : "", ...lines, `Total: ${brl(order.total)}`, `Nome: ${name}`, `Endereço: ${address}`].filter(Boolean).join("\n");
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    }
    navigate({ to: "/pedidos" });
  };

  const field = "mt-1 h-12 w-full rounded-xl border bg-card px-4 outline-none focus:ring-2 focus:ring-ring";
  return (
    <form onSubmit={submit} className="px-4 pt-4 md:mx-auto md:max-w-xl md:pt-8">
      <Link to="/carrinho" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"><ArrowLeft className="size-4" /> Carrinho</Link>
      <h1 className="mt-2 text-2xl font-extrabold">Finalizar pedido</h1>
      <div className="mt-4 space-y-3">
        <label className="block text-sm font-semibold">Nome<input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
        <label className="block text-sm font-semibold">WhatsApp<input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="(11) 99999-9999" /></label>
        <label className="block text-sm font-semibold">Endereço de entrega<input className={field} value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" placeholder="Rua, número, bairro" /></label>
      </div>
      <h2 className="mt-6 font-bold">Pagamento</h2>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {([["pix", "PIX", QrCode], ["whatsapp", "WhatsApp", MessageCircle]] as const).map(([v, l, I]) => (
          <button type="button" key={v} onClick={() => setPayment(v)} aria-pressed={payment === v}
            className={`flex h-16 items-center justify-center gap-2 rounded-2xl border-2 bg-card font-bold ${payment === v ? "border-primary text-primary-strong" : "border-transparent"}`}>
            <I className="size-5" /> {l}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {payment === "pix" ? "O código PIX é enviado após a confirmação. O pedido só é preparado após o pagamento." : "Abriremos o WhatsApp com seu pedido para combinar o pagamento."}
      </p>
      <div className="mt-5"><PriceSummary /></div>
      {error && <p role="alert" className="mt-3 text-sm font-semibold text-destructive">{error}</p>}
      <button type="submit" className="mt-4 h-14 w-full rounded-full bg-accent font-bold text-accent-foreground hover:bg-accent-strong">
        Confirmar pedido · {brl(cart.total)}
      </button>
    </form>
  );
}
