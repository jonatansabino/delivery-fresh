import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DELIVERY_FEE, getMeal, getPlan } from "./menu";

export interface Order {
  id: string;
  createdAt: string;
  items: { mealId: string; qty: number }[];
  planId?: string;
  total: number;
  payment: "pix" | "whatsapp";
  status: "aguardando_pagamento" | "confirmado" | "em_preparo" | "a_caminho" | "entregue";
  address: string;
  name: string;
}

interface CartState {
  items: Record<string, number>;
  planId?: string;
  orders: Order[];
}

interface CartApi extends CartState {
  add: (id: string, n?: number) => void;
  setQty: (id: string, n: number) => void;
  setPlan: (id?: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  delivery: number;
  total: number;
  placeOrder: (o: Omit<Order, "id" | "createdAt" | "items" | "planId" | "total" | "status">) => Order;
}

const KEY = "freshbites-cart-v1";
const Ctx = createContext<CartApi | null>(null);

/** Plan price = meals × price per meal; à la carte items priced individually. */
export function computeTotals(items: Record<string, number>, planId?: string) {
  const plan = planId ? getPlan(planId) : undefined;
  const count = Object.values(items).reduce((a, b) => a + b, 0);
  const subtotal = plan
    ? plan.meals * plan.pricePerMeal
    : Object.entries(items).reduce((s, [id, q]) => s + (getMeal(id)?.price ?? 0) * q, 0);
  const delivery = count > 0 ? DELIVERY_FEE : 0;
  return { count, subtotal, delivery, total: subtotal + delivery };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>({ items: {}, orders: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  const api = useMemo<CartApi>(() => {
    const totals = computeTotals(state.items, state.planId);
    const setQty = (id: string, n: number) =>
      setState((s) => {
        const items = { ...s.items };
        if (n <= 0) delete items[id];
        else items[id] = n;
        return { ...s, items };
      });
    return {
      ...state,
      ...totals,
      setQty,
      add: (id, n = 1) => setQty(id, (state.items[id] ?? 0) + n),
      setPlan: (planId) => setState((s) => ({ ...s, planId, items: planId === s.planId ? s.items : {} })),
      clear: () => setState((s) => ({ ...s, items: {}, planId: undefined })),
      placeOrder: (o) => {
        const order: Order = {
          ...o,
          id: Math.random().toString(36).slice(2, 8).toUpperCase(),
          createdAt: new Date().toISOString(),
          items: Object.entries(state.items).map(([mealId, qty]) => ({ mealId, qty })),
          planId: state.planId,
          total: totals.total,
          status: "aguardando_pagamento",
        };
        setState((s) => ({ items: {}, planId: undefined, orders: [order, ...s.orders] }));
        return order;
      },
    };
  }, [state]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
