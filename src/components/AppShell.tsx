import { PwaStatus } from "./PwaStatus";
import { NavLink as Link, useLocation } from "react-router-dom";
import {
  Home,
  UtensilsCrossed,
  CalendarCheck,
  Receipt,
  User,
  ShoppingBag,
  Leaf,
} from "lucide-react";
import type { ReactNode } from "react";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/menu";

const NAV = [
  { to: "/", label: "Início", icon: Home },
  { to: "/cardapio", label: "Cardápio", icon: UtensilsCrossed },
  { to: "/meu-plano", label: "Meu Plano", icon: CalendarCheck },
  { to: "/pedidos", label: "Pedidos", icon: Receipt },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Leaf className="size-5" />
      </span>
      <span className="text-lg">
        FreshBites <span className="text-primary">Fit</span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useLocation().pathname;
  const { count, total, settings } = useCart();
  const hideNav = path.startsWith("/checkout");
  const showCartBar =
    count > 0 &&
    !hideNav &&
    path !== "/carrinho" &&
    path !== "/montar-plano" &&
    !path.startsWith("/admin");

  return (
    <div className="min-h-dvh bg-background">
      <PwaStatus />
      <header className="sticky top-0 z-30 hidden border-b bg-card/90 backdrop-blur md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="flex items-center gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary-soft [&.active]:text-primary-strong"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/carrinho"
            className="relative flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground hover:bg-accent-strong"
          >
            <ShoppingBag className="size-4" /> Carrinho {count > 0 && <span>({count})</span>}
          </Link>
        </div>
      </header>

      <div className="bg-primary-soft px-4 py-2 text-center text-xs text-primary-strong">
        {settings.storeName} • Demonstração com dados neste dispositivo
      </div>
      <main className={`mx-auto max-w-6xl ${hideNav ? "pb-8" : "pb-40 md:pb-16"}`}>{children}</main>

      {showCartBar && (
        <Link
          to="/carrinho"
          className="fixed inset-x-3 bottom-[calc(76px+env(safe-area-inset-bottom))] z-30 flex items-center justify-between rounded-2xl bg-foreground px-4 py-3 text-background shadow-float md:hidden"
        >
          <span className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <ShoppingBag className="size-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold">
                {count} {count === 1 ? "item" : "itens"}
              </span>
              <span className="text-xs opacity-70">Ver carrinho</span>
            </span>
          </span>
          <span className="font-bold">{brl(total)}</span>
        </Link>
      )}

      {!hideNav && (
        <nav
          className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-card md:hidden"
          aria-label="Navegação principal"
        >
          <div className="grid grid-cols-5">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className="flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground [&.active]:text-primary-strong"
              >
                <n.icon className="size-5" />
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
