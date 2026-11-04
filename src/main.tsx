import React, { Component, Suspense, lazy, useEffect, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { CartProvider, useCart } from "@/lib/cart";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/routes/index";
import Cardapio from "@/routes/cardapio";
import Planos from "@/routes/planos";
import MeuPlano from "@/routes/meu-plano";
import Carrinho from "@/routes/carrinho";
import Checkout from "@/routes/checkout";
import Pedidos from "@/routes/pedidos";
import Perfil from "@/routes/perfil";
import Produto from "@/routes/produto.$id";
const MontarPlano = lazy(() => import("@/routes/montar-plano"));
const Freshpoints = lazy(() => import("@/routes/freshpoints"));
const Economia = lazy(() => import("@/routes/economia"));
const Notificacoes = lazy(() => import("@/routes/notificacoes"));
const Admin = lazy(() => import("@/routes/admin"));
import "@/styles.css";
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? (
      <section className="page">
        <h1>Não foi possível carregar a aplicação</h1>
        <button className="btn" onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
      </section>
    ) : (
      this.props.children
    );
  }
}
export function App() {
  const { storageError, preferences } = useCart();
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () =>
      document.documentElement.classList.toggle(
        "dark",
        preferences.theme === "dark" || (preferences.theme === "system" && media.matches),
      );
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [preferences.theme]);
  return (
    <AppShell>
      {storageError && (
        <p role="alert" className="m-4 rounded-xl bg-destructive/10 p-4 text-destructive">
          {storageError}
        </p>
      )}
      <Suspense
        fallback={
          <p className="page animate-pulse" role="status">
            Carregando…
          </p>
        }
      >
        <Routes>
          <Route path="/montar-plano" element={<MontarPlano />} />
          <Route path="/favoritos" element={<Cardapio favoritesOnly />} />
          <Route path="/freshpoints" element={<Freshpoints />} />
          <Route path="/economia" element={<Economia />} />
          <Route path="/notificacoes" element={<Notificacoes />} />
          <Route path="/" element={<Index />} />
          <Route path="/cardapio" element={<Cardapio />} />
          <Route path="/planos" element={<Planos />} />
          <Route path="/meu-plano" element={<MeuPlano />} />
          <Route path="/produto/:id" element={<Produto />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route
            path="/admin"
            element={
              <Suspense
                fallback={
                  <p className="page" role="status">
                    Carregando painel…
                  </p>
                }
              >
                <Admin />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <section className="page">
                <h1>Página não encontrada</h1>
                <Link to="/">Voltar ao início</Link>
              </section>
            }
          />
        </Routes>
      </Suspense>
      <Toaster position="top-center" />
    </AppShell>
  );
}
const root = document.getElementById("root");
if (root)
  createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <CartProvider>
            <App />
          </CartProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>,
  );
