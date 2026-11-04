import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { StorageService, STORAGE_KEY } from "@/services/storage";
import { initialState } from "@/data/demo";
import { whatsappUrl } from "@/services/whatsapp";
beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());
describe("StorageService", () => {
  it.each(["{invalid", "null", '{"items":{}}'])("recupera dados inválidos: %s", (raw) => {
    localStorage.setItem(STORAGE_KEY, raw);
    const result = StorageService.read();
    expect(result.data.meals.length).toBeGreaterThan(0);
    expect(result.error).not.toBe("");
  });
  it("remove referências inexistentes do carrinho", () => {
    StorageService.write({
      ...structuredClone(initialState),
      items: { apagado: 1 },
      planId: "apagado",
    });
    expect(StorageService.read().data.items).toEqual({});
    expect(StorageService.read().data.planId).toBeUndefined();
  });
  it("reporta falha de leitura e gravação", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error();
    });
    expect(StorageService.read().error).not.toBe("");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error();
    });
    expect(() => StorageService.write(initialState)).toThrow("Não foi possível salvar");
  });
  it("codifica mensagem com cliente, endereço, itens e pagamento", () => {
    const url = whatsappUrl(
      { ...initialState.orders[0]!, status: "aguardando_pagamento" },
      "5511999999999",
    );
    const message = new URL(url).searchParams.get("text");
    expect(message).toContain(initialState.orders[0]!.address);
    expect(message).toContain("aguardando pagamento");
    expect(message).toContain("2x");
  });
});

it("mensagem de pedido entregue preserva seu status local", () => {
  const message = new URL(whatsappUrl(initialState.orders[0]!, "5511999999999")).searchParams.get(
    "text",
  );
  expect(message).toContain("Status local demonstrativo: entregue");
  expect(message).not.toContain("aguardando pagamento");
});
