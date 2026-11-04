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
