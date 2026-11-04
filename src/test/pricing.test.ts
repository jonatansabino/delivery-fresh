import { describe, expect, it } from "vitest";
import { computeTotals } from "@/lib/cart";

describe("plan pricing", () => {
  it("Essencial: 5 marmitas a R$22 = R$110 + entrega", () => {
    const t = computeTotals({ "frango-arroz-feijao": 5 }, "essencial");
    expect(t.subtotal).toBe(110);
  });
  it("Executivo: 10 a R$20 = R$200", () => {
    expect(computeTotals({ "bowl-vegano": 10 }, "executivo").subtotal).toBe(200);
  });
  it("Casal/Foco: 15 a R$19 = R$285", () => {
    expect(computeTotals({ "bowl-vegano": 15 }, "casal").subtotal).toBe(285);
  });
});

describe("preços e cupons", () => {
  it("carrinho vazio não cobra plano nem entrega", () => {
    expect(computeTotals({}, "essencial").total).toBe(0);
  });
  it("ignora referências inválidas e quantidades negativas", () => {
    expect(computeTotals({ falso: 2, "bowl-vegano": -2 }).total).toBe(0);
  });
  it("aplica FIT10 no subtotal sem descontar entrega", () => {
    const t = computeTotals({ "bowl-vegano": 5 }, "essencial", undefined, undefined, 7.9, "FIT10");
    expect(t.discount).toBe(11);
    expect(t.total).toBe(106.9);
  });
});
