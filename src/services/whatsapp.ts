import type { Order } from "@/data/demo";
import { brl } from "@/lib/menu";
export function whatsappMessage(order: Order) {
  const a = order.addressDetails;
  return [
    "Olá! Quero confirmar meu pedido FreshBites Fit.",
    `Pedido: #${order.id}`,
    `Cliente: ${order.name}`,
    `WhatsApp: ${order.phone}`,
    `Plano: ${order.planName ?? "Avulso"}`,
    "Marmitas:",
    ...order.items.map(
      (i) =>
        `- ${i.name} — ${i.qty}x — ${brl(i.price)} cada${i.addOns?.length ? `\n  Adicionais por marmita: ${i.addOns.map((a) => `${a.name} (${brl(a.price)})`).join(", ")}` : ""}`,
    ),
    "Entrega:",
    ...(a
      ? [
          `CEP: ${a.cep.slice(0, 5)}-${a.cep.slice(5)}`,
          `Rua: ${a.street}`,
          `Número: ${a.noNumber ? "Sem número" : a.number}`,
          `Complemento: ${a.complement || "Não informado"}`,
          `Bairro: ${a.neighborhood}`,
          `Cidade: ${a.city}`,
          `UF: ${a.uf}`,
          `Referência: ${a.reference || "Não informada"}`,
        ]
      : [`Endereço: ${order.address}`]),
    `Data solicitada: ${order.deliveryDate.split("-").reverse().join("/")}`,
    `Subtotal: ${brl(order.subtotal)}`,
    `Taxa de entrega: ${brl(order.delivery)}`,
    `Desconto: ${brl(order.discount)}`,
    `Total: ${brl(order.total)}`,
    `Observações: ${order.observations || "Nenhuma"}`,
    "Forma de pagamento: PIX a combinar.",
    `Status local demonstrativo: ${order.status.replaceAll("_", " ")}. Não comprova pagamento ou confirmação da empresa.`,
    "Aguardo confirmação. Obrigado!",
  ].join("\n");
}
export function whatsappUrl(order: Order, number: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(whatsappMessage(order))}`;
}
export function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
