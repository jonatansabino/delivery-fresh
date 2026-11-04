import { renderHook, act, cleanup } from "@testing-library/react";
import { beforeEach, afterEach, it, expect, describe } from "vitest";
import { CartProvider, useCart, computeTotals } from "@/lib/cart";
import { StorageService, STORAGE_KEY } from "@/services/storage";
import { initialState } from "@/data/demo";
import { checkoutState, testAddress } from "./fixtures";
import { checkCoupon } from "@/services/coupons";
import { deliveryFor, availableDates } from "@/services/delivery";
import { mockCoupons } from "@/data/mockCoupons";
import { nutritionTotals } from "@/components/planner/NutritionSummary";
beforeEach(() => localStorage.clear());
afterEach(() => cleanup());
describe("Regras locais", () => {
  it("não confirma regiões apenas por CEP e normaliza cidade e bairro", () => {
    expect(
      deliveryFor(
        { ...testAddress, neighborhood: "  SE ", city: "sao paulo" },
        initialState.deliveryZones,
      )?.fee,
    ).toBe(7.9);
    expect(
      deliveryFor({ ...testAddress, neighborhood: "Desconhecido" }, initialState.deliveryZones),
    ).toBeUndefined();
  });
  it("oferece apenas datas futuras de dias ativos", () => {
    const dates = availableDates(
      [{ id: "segunda", weekday: 1, label: "Manhã", active: true }],
      new Date(2026, 10, 4),
    );
    expect(dates.length).toBeGreaterThan(0);
    expect(
      dates.every((d) => new Date(d.date + "T12:00:00").getDay() === 1 && d.date > "2026-11-04"),
    ).toBe(true);
  });
  it("valida mínimo, vencimento, limite, inativo e desconto fixo limitado ao subtotal", () => {
    expect(checkCoupon("BEMVINDO", 20, mockCoupons, {}).error).toContain("mínima");
    expect(checkCoupon("FIT10", 100, mockCoupons, { FIT10: 20 }).error).toContain("Limite");
    expect(checkCoupon("FIT10", 100, mockCoupons, {}, "2028-01-01").error).toContain("expirado");
    expect(
      checkCoupon(
        "FIT10",
        100,
        mockCoupons.map((c) => ({ ...c, active: false })),
        {},
      ).discount,
    ).toBe(0);
    expect(checkCoupon("BEMVINDO", 30, mockCoupons, {}).discount).toBe(5);
    expect(
      checkCoupon(
        "BEMVINDO",
        30,
        mockCoupons.map((c) => ({ ...c, value: 100 })),
        {},
      ).discount,
    ).toBe(30);
  });
  it("recalcula adicionais pela quantidade, inclusive em plano", () => {
    const t = computeTotals(
      { "frango-arroz-feijao": 5 },
      "essencial",
      undefined,
      undefined,
      7.9,
      "",
      undefined,
      {},
      { "frango-arroz-feijao": ["legumes"] },
    );
    expect(t.additions).toBe(20);
    expect(t.subtotal).toBe(130);
    expect(t.total).toBe(137.9);
  });
  it("preserva carrinho, usa cupom uma vez e impede criação repetida após checkout", () => {
    StorageService.write({ ...checkoutState(), coupon: "FIT10" });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    let id = "";
    act(() => {
      id = result.current.placeOrder({
        name: "Maria Teste",
        phone: "11987654321",
        deliveryDate: result.current.wizard.deliveryDate,
        slotId: result.current.wizard.slotId,
      }).id;
    });
    expect(id).not.toBe("");
    expect(StorageService.read().data.usedCoupons["FIT10"]).toBe(1);
    expect(() =>
      result.current.placeOrder({
        name: "Maria Teste",
        phone: "11987654321",
        deliveryDate: result.current.wizard.deliveryDate,
        slotId: result.current.wizard.slotId,
      }),
    ).toThrow("seleção");
    expect(StorageService.read().data.orders.filter((o) => o.id === id)).toHaveLength(1);
  });
  it("revalida disponibilidade antes de criar pedido", () => {
    const data = checkoutState();
    data.meals = data.meals.map((m) => (m.id === "bowl-vegano" ? { ...m, active: false } : m));
    StorageService.write(data);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    expect(() =>
      result.current.placeOrder({
        name: "Maria Teste",
        phone: "11987654321",
        deliveryDate: result.current.wizard.deliveryDate,
        slotId: result.current.wizard.slotId,
      }),
    ).toThrow("indisponível");
  });
  it("pontos são creditados uma vez e estornados uma vez no cancelamento", () => {
    const data = checkoutState();
    StorageService.write(data);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    const order = data.orders[0]!;
    act(() => {
      result.current.setOrderStatus(order.id, "confirmado");
      result.current.setOrderStatus(order.id, "em_preparo");
      result.current.setOrderStatus(order.id, "confirmado");
    });
    expect(StorageService.read().data.loyalty).toHaveLength(1);
    act(() => {
      result.current.setOrderStatus(order.id, "cancelado");
      result.current.setOrderStatus(order.id, "confirmado");
      result.current.setOrderStatus(order.id, "cancelado");
    });
    expect(StorageService.read().data.loyalty).toHaveLength(2);
    expect(StorageService.read().data.loyalty.reduce((n, l) => n + l.points, 0)).toBe(0);
    expect(StorageService.read().data.orders[0]!.statusHistory!.length).toBeGreaterThan(1);
  });
  it("repositórios editam catálogo e endereços sem sobrescrever outros módulos", () => {
    StorageService.write(checkoutState());
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    act(() => {
      result.current.repositories.products.save({ ...result.current.meals[0]!, price: 30 });
      result.current.saveAddress({ ...testAddress, street: "Rua Editada", number: "200" });
    });
    const stored = StorageService.read().data;
    expect(stored.meals[0]?.price === 30 || stored.meals.some((m) => m.price === 30)).toBe(true);
    expect(stored.addressBook).toHaveLength(1);
    expect(stored.addressBook[0]!.number).toBe("200");
    expect(stored.items["bowl-vegano"]).toBe(2);
  });
  it("nutrição não inventa campos desconhecidos", () => {
    const meal = { ...initialState.meals[0]!, protein: null };
    const t = nutritionTotals([{ id: "unit", mealId: meal.id, day: 0 }], [meal]);
    expect(t.protein).toBe(0);
    expect(t.missing).toBe(1);
  });
});
describe("Backup versionado", () => {
  it("migra payload v2 sem perder carrinho, preços ou perfil", () => {
    const legacy = {
      ...structuredClone(initialState),
      items: { "bowl-vegano": 3 },
      preferences: { name: "Nome Anterior", phone: "11999999999", diet: "Vegano" },
    } as Record<string, unknown>;
    for (const key of [
      "version",
      "favorites",
      "categories",
      "coupons",
      "addressBook",
      "planner",
      "wizard",
      "deliveryZones",
      "deliverySlots",
      "notifications",
      "reviews",
      "production",
      "loyalty",
      "usedCoupons",
      "cartAddOns",
      "selectedAddressId",
      "redeemedRewards",
    ])
      delete legacy[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
    const data = StorageService.read().data;
    expect(data.items["bowl-vegano"]).toBe(3);
    expect(data.preferences.name).toBe("Nome Anterior");
    expect(data.version).toBe(3);
    expect(data.preferences.theme).toBe("system");
  });
  it("exporta e importa sem perder dados e rejeita arquivo inválido sem sobrescrever", () => {
    const data = checkoutState();
    StorageService.write(data);
    const backup = StorageService.exportData();
    StorageService.importData(backup);
    expect(StorageService.read().data.addressBook[0]!.cep).toBe("01001000");
    const before = localStorage.getItem(STORAGE_KEY);
    expect(() =>
      StorageService.importData('{"format":"freshbites-fit","version":3,"data":{}}'),
    ).toThrow();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(before);
  });
  it("rejeita IDs duplicados, referências inválidas e versão incompatível", () => {
    const data = checkoutState();
    data.meals.push(data.meals[0]!);
    expect(() =>
      StorageService.parseImport(JSON.stringify({ format: "freshbites-fit", version: 3, data })),
    ).toThrow();
    expect(() =>
      StorageService.parseImport('{"format":"freshbites-fit","version":4,"data":{}}'),
    ).toThrow();
  });
  it("restaura Mock Data e limpa somente o módulo solicitado", () => {
    StorageService.write({ ...checkoutState(), favorites: ["bowl-vegano"] });
    StorageService.clearModule("favorites");
    expect(StorageService.getItem("favorites")).toEqual([]);
    expect(StorageService.getItem("items")["bowl-vegano"]).toBe(2);
    StorageService.resetDemoData();
    expect(StorageService.getItem("items")).toEqual({});
  });
});
