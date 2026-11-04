import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { MEALS, PLANS, DELIVERY_FEE, type Meal, type Plan } from "./menu";
import { initialState, type AppState, type Order, type statuses } from "@/data/demo";
import { mockCoupons } from "@/data/mockCoupons";
import { type Coupon, type Address } from "@/types/models";
import { StorageService } from "@/services/storage";
import { checkCoupon } from "@/services/coupons";
import { deliveryFor, formatAddress, availableDates } from "@/services/delivery";
import { createLocalRepositories } from "@/repositories/local";
export type { Order } from "@/data/demo";
const round = (value: number) => Math.round(value * 100) / 100;
export function computeTotals(
  items: Record<string, number>,
  planId?: string,
  meals: Meal[] = MEALS,
  plans: Plan[] = PLANS,
  fee = DELIVERY_FEE,
  coupon = "",
  coupons: Coupon[] = mockCoupons,
  used: Record<string, number> = {},
  addOns: Record<string, string[]> = {},
) {
  const plan = plans.find((p) => p.id === planId);
  const valid = Object.entries(items).filter(
    ([id, qty]) => meals.some((m) => m.id === id) && Number.isInteger(qty) && qty > 0,
  );
  const count = valid.reduce((n, [, q]) => n + q, 0);
  const additions = valid.reduce(
    (sum, [id, qty]) =>
      sum +
      qty *
        (meals.find((m) => m.id === id)?.addOns ?? [])
          .filter((a) => (addOns[id] ?? []).includes(a.id))
          .reduce((n, a) => n + a.price, 0),
    0,
  );
  const subtotal = round(
    (count === 0
      ? 0
      : plan
        ? plan.meals * plan.pricePerMeal
        : valid.reduce((n, [id, q]) => n + meals.find((m) => m.id === id)!.price * q, 0)) +
      additions,
  );
  const result = checkCoupon(coupon, subtotal, coupons, used);
  const delivery = count ? fee : 0;
  return {
    count,
    subtotal,
    additions,
    discount: result.discount,
    couponError: result.error,
    delivery,
    total: round(subtotal - result.discount + delivery),
  };
}
export function notify(s: AppState, text: string): AppState {
  return {
    ...s,
    notifications: [
      { id: crypto.randomUUID(), text, date: new Date().toISOString(), read: false },
      ...s.notifications,
    ].slice(0, 200),
  };
}
function useStore() {
  const [loaded] = useState(() => StorageService.read());
  const [state, setState] = useState(loaded.data);
  const current = useRef(state);
  const [storageError, setStorageError] = useState(loaded.error);
  const update = (change: (s: AppState) => AppState): boolean => {
    try {
      const next = change(current.current);
      StorageService.write(next);
      current.current = next;
      setState(next);
      setStorageError("");
      return true;
    } catch (e) {
      setStorageError(e instanceof Error ? e.message : "Erro de armazenamento.");
      return false;
    }
  };
  const repositories = createLocalRepositories(() => current.current, update);
  const selectedAddress =
    state.addressBook.find((a) => a.id === state.selectedAddressId) ??
    state.addressBook.find((a) => a.primary);
  const zone = deliveryFor(selectedAddress, state.deliveryZones);
  const calculate = (s: AppState) => {
    const address =
      s.addressBook.find((a) => a.id === s.selectedAddressId) ??
      s.addressBook.find((a) => a.primary);
    const fee = deliveryFor(address, s.deliveryZones)?.fee ?? s.settings.deliveryFee;
    return computeTotals(
      s.items,
      s.planId,
      s.meals,
      s.plans,
      fee,
      s.coupon,
      s.coupons,
      s.usedCoupons,
      s.cartAddOns,
    );
  };
  const totals = calculate(state);
  const setQty = (id: string, n: number) =>
    update((s) => {
      const meal = s.meals.find((m) => m.id === id);
      if (!meal || !Number.isFinite(n)) throw new Error("Produto indisponível.");
      if (n > 0 && meal.active === false)
        throw new Error("Este produto está inativo. Remova-o do carrinho.");
      const items = { ...s.items };
      const previous = items[id] ?? 0;
      const max = s.plans.find((p) => p.id === s.planId)?.meals;
      if (
        max &&
        n > previous &&
        Object.values(items).reduce((a, b) => a + b, 0) + n - previous > max
      )
        throw new Error(`Seu plano permite ${max} marmitas. Remova uma antes de adicionar outra.`);
      if (n <= 0) delete items[id];
      else items[id] = Math.min(99, Math.floor(n));
      // Keep only scheduled units still in the cart.
      const seen: Record<string, number> = {};
      const planner = s.planner.filter((p) => {
        seen[p.mealId] = (seen[p.mealId] ?? 0) + 1;
        return (seen[p.mealId] ?? 0) <= (items[p.mealId] ?? 0);
      });
      const next = { ...s, items, planner };
      return n > previous ? notify(next, "Produto adicionado ao carrinho.") : next;
    });
  function saveAddress(a: Address) {
    return update((s) => ({
      ...s,
      addressBook: [
        ...s.addressBook
          .filter((v) => v.id !== a.id)
          .map((v) => (a.primary ? { ...v, primary: false } : v)),
        a,
      ],
      selectedAddressId: a.id,
    }));
  }
  function setOrderStatus(id: string, status: (typeof statuses)[number]) {
    return update((s) => {
      const order = s.orders.find((o) => o.id === id);
      if (!order || order.status === status) return s;
      const date = new Date().toISOString();
      const loyalty = [...s.loyalty];
      if (status === "confirmado" && !loyalty.some((l) => l.id === `earned-${id}`))
        loyalty.push({
          id: `earned-${id}`,
          orderId: id,
          points: Math.floor(order.total),
          text: `Pedido #${id.slice(0, 8)} confirmado no modo demo`,
          date,
        });
      const earned = loyalty.find((l) => l.id === `earned-${id}`);
      if (status === "cancelado" && earned && !loyalty.some((l) => l.id === `reversed-${id}`))
        loyalty.push({
          id: `reversed-${id}`,
          orderId: id,
          points: -earned.points,
          text: "Estorno de pontos por cancelamento demo",
          date,
        });
      return notify(
        {
          ...s,
          loyalty,
          orders: s.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  statusHistory: [
                    ...(o.statusHistory ?? [{ status: o.status, date: o.createdAt }]),
                    { status, date },
                  ],
                }
              : o,
          ),
        },
        `Status demonstrativo do pedido #${id.slice(0, 8)}: ${status.replaceAll("_", " ")}.`,
      );
    });
  }
  return {
    ...state,
    ...totals,
    selectedAddress,
    zone,
    storageError,
    update,
    repositories,
    saveAddress,
    setOrderStatus,
    setQty,
    getMeal: (id: string) => state.meals.find((m) => m.id === id),
    getPlan: (id: string) => state.plans.find((p) => p.id === id),
    add: (id: string, n = 1) => setQty(id, (current.current.items[id] ?? 0) + n),
    setPlan: (planId?: string) =>
      update((s) => {
        if (planId && !s.plans.some((p) => p.id === planId && p.active !== false))
          throw new Error("Plano indisponível.");
        return {
          ...s,
          planId,
          items: !planId || planId === s.planId ? s.items : {},
          planner: planId === s.planId ? s.planner : [],
          cartAddOns: planId === s.planId ? s.cartAddOns : {},
          coupon: "",
        };
      }),
    clear: () =>
      update((s) => ({ ...s, items: {}, planId: undefined, coupon: "", cartAddOns: {} })),
    toggleFavorite: (id: string) =>
      update((s) => ({
        ...s,
        favorites: s.favorites.includes(id)
          ? s.favorites.filter((v) => v !== id)
          : [...s.favorites, id],
      })),
    applyCoupon: (code: string) =>
      update((s) => {
        const totals = calculate({ ...s, coupon: code });
        if (totals.couponError) throw new Error(totals.couponError);
        return notify(
          { ...s, coupon: code },
          code ? `Cupom demonstrativo ${code} aplicado.` : "Cupom removido.",
        );
      }),
    repeatOrder: (order: Order) =>
      update((s) => {
        if (order.items.some((i) => !s.meals.some((m) => m.id === i.mealId && m.active !== false)))
          throw new Error(
            "Há produtos indisponíveis neste pedido. Escolha novas marmitas no cardápio.",
          );
        const plan = s.plans.find(
          (p) =>
            p.id === order.planId &&
            p.active !== false &&
            p.meals === order.items.reduce((n, i) => n + i.qty, 0),
        );
        return notify(
          {
            ...s,
            items: Object.fromEntries(order.items.map((i) => [i.mealId, i.qty])),
            planId: plan?.id,
            cartAddOns: Object.fromEntries(
              order.items.map((i) => [i.mealId, (i.addOns ?? []).map((a) => a.id)]),
            ),
            coupon: "",
            planner: [],
          },
          "Pedido repetido no carrinho. Confira preços, adicionais e disponibilidade atuais.",
        );
      }),
    replaceData: (next: AppState) => update(() => next),
    resetDemo: () => update(() => structuredClone(initialState)),
    placeOrder: (
      input: Pick<Order, "name" | "phone" | "deliveryDate"> & {
        observations?: string;
        slotId?: string;
      },
    ): Order => {
      const s = current.current;
      const totals = calculate(s);
      const plan = s.plans.find((p) => p.id === s.planId);
      if (!totals.count || (plan && (plan.active === false || totals.count !== plan.meals)))
        throw new Error("Complete a seleção das marmitas antes de finalizar.");
      if (
        Object.keys(s.items).some((id) => !s.meals.some((m) => m.id === id && m.active !== false))
      )
        throw new Error("Um produto ficou indisponível. Revise seu carrinho.");
      if (totals.couponError) throw new Error(totals.couponError);
      const address =
        s.addressBook.find((a) => a.id === s.selectedAddressId) ??
        s.addressBook.find((a) => a.primary);
      if (!address || !deliveryFor(address, s.deliveryZones))
        throw new Error("Selecione um endereço em uma região atendida na demonstração.");
      if (
        !availableDates(s.deliverySlots).some(
          (d) => d.date === input.deliveryDate && d.slot.id === input.slotId,
        )
      )
        throw new Error("Selecione uma data e faixa de entrega disponível.");
      if (input.name.trim().length < 2 || !/^\d{10,13}$/.test(input.phone))
        throw new Error("Informe nome e WhatsApp válidos.");
      const createdAt = new Date().toISOString();
      const order: Order = {
        ...input,
        id: crypto.randomUUID().toUpperCase(),
        createdAt,
        address: formatAddress(address),
        addressDetails: structuredClone(address),
        items: Object.entries(s.items).map(([mealId, qty]) => {
          const meal = s.meals.find((m) => m.id === mealId)!;
          return {
            mealId,
            qty,
            name: meal.name,
            price: plan?.pricePerMeal ?? meal.price,
            addOns: (meal.addOns ?? []).filter((a) => (s.cartAddOns[mealId] ?? []).includes(a.id)),
          };
        }),
        planId: plan?.id,
        planName: plan?.name,
        subtotal: totals.subtotal,
        delivery: totals.delivery,
        discount: totals.discount,
        total: totals.total,
        status: "aguardando_pagamento",
        payment: "whatsapp",
        statusHistory: [{ status: "aguardando_pagamento", date: createdAt }],
        planner: structuredClone(s.planner),
        couponCode: s.coupon,
      };
      const existing = s.customers.find((c) => c.phone.replace(/\D/g, "") === input.phone);
      if (
        !update((v) =>
          notify(
            {
              ...v,
              orders: [order, ...v.orders],
              items: {},
              planId: undefined,
              cartAddOns: {},
              coupon: "",
              usedCoupons: s.coupon
                ? { ...v.usedCoupons, [s.coupon]: (v.usedCoupons[s.coupon] ?? 0) + 1 }
                : v.usedCoupons,
              customers: [
                ...v.customers.filter((c) => c.id !== existing?.id),
                {
                  id: existing?.id ?? crypto.randomUUID(),
                  name: input.name,
                  phone: input.phone,
                  address: order.address,
                },
              ],
              preferences: { ...v.preferences, name: input.name, phone: input.phone },
              wizard: { ...v.wizard, step: 8 },
            },
            "Pedido salvo localmente. Envie a mensagem pelo WhatsApp para solicitar confirmação.",
          ),
        )
      )
        throw new Error(
          "O pedido não foi salvo. Confira o aviso de armazenamento e tente novamente.",
        );
      return order;
    },
  };
}
const Ctx = createContext<ReturnType<typeof useStore> | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const store = useStore();
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
export function useCart() {
  const store = useContext(Ctx);
  if (!store) throw new Error("useCart fora do provider");
  return store;
}
