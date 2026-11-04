import { checkoutState } from "./fixtures";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { App } from "@/main";
import { CartProvider } from "@/lib/cart";
import { initialState } from "@/data/demo";
import { StorageService, STORAGE_KEY } from "@/services/storage";
function app(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <CartProvider>
        <App />
      </CartProvider>
    </MemoryRouter>,
  );
}
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("Fluxos principais", () => {
  it("renderiza home e página inexistente", () => {
    app("/inexistente");
    expect(screen.getByRole("heading", { name: "Página não encontrada" })).toBeInTheDocument();
  });
  it("adiciona marmitas e preserva o carrinho ao remontar", () => {
    app("/cardapio");
    fireEvent.click(screen.getAllByRole("button", { name: /Adicionar/ })[0]!);
    expect(StorageService.read().data.items["frango-arroz-feijao"]).toBe(1);
    cleanup();
    app("/carrinho");
    expect(screen.getByText("Frango Grelhado com Arroz e Feijão Preto")).toBeInTheDocument();
  });
  it("bloqueia checkout de plano incompleto", () => {
    StorageService.write({
      ...structuredClone(initialState),
      planId: "essencial",
      items: { "bowl-vegano": 1 },
    });
    app("/checkout");
    expect(screen.getByRole("heading", { name: "Complete seu plano" })).toBeInTheDocument();
  });
  it("salva pedido antes de abrir WhatsApp e mantém pagamento pendente", () => {
    StorageService.write(checkoutState());
    const open = vi.spyOn(window, "open").mockImplementation(() => {
      expect(StorageService.read().data.orders[0]!.name).toBe("Maria Teste");
      return null;
    });
    app("/checkout");
    fireEvent.change(screen.getByLabelText("Nome completo"), { target: { value: "Maria Teste" } });
    fireEvent.change(screen.getByLabelText("WhatsApp"), { target: { value: "11987654321" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar pedido e abrir WhatsApp" }));
    expect(screen.getByText("Pedido salvo neste dispositivo!")).toBeInTheDocument();
    expect(open).toHaveBeenCalledTimes(1);
    expect(open.mock.calls[0]![0]).toContain("https://wa.me/");
    expect(StorageService.read().data.orders[0]!.status).toBe("aguardando_pagamento");
    expect(StorageService.read().data.items).toEqual({});
  });
  it("não abre WhatsApp ou perde carrinho se armazenamento falhar", () => {
    StorageService.write({
      ...checkoutState(),
      items: { "bowl-vegano": 1 },
      preferences: {
        ...initialState.preferences,
        name: "Maria Teste",
        phone: "11987654321",
        diet: "Todas",
      },
      addresses: ["Rua Teste, 123"],
    });
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    app("/checkout");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota");
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar pedido e abrir WhatsApp" }));
    expect(open).not.toHaveBeenCalled();
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).items["bowl-vegano"]).toBe(1);
  });
  it("edita produto pelo painel e preserva alteração", async () => {
    app("/admin");
    fireEvent.click(await screen.findByRole("button", { name: "Entrar na demonstração" }));
    fireEvent.click(screen.getByRole("button", { name: "Produtos" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Editar" })[0]!);
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Frango Especial Local" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(StorageService.read().data.meals.some((m) => m.name === "Frango Especial Local")).toBe(
      true,
    );
  });
});
