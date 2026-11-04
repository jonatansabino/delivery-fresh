import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { AddressForm } from "@/components/address/AddressForm";
import { testAddress } from "./fixtures";
import * as cep from "@/services/cep";
import { addressSchema } from "@/types/models";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
beforeEach(() => cep.clearCepCache());
const input = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
describe("Endereço mobile", () => {
  it("preenche CEP e preserva número e complemento em nova consulta", async () => {
    const lookup = vi.spyOn(cep, "lookupCep").mockResolvedValue({
      street: "Praça da Sé",
      neighborhood: "Sé",
      city: "São Paulo",
      uf: "SP",
    });
    render(<AddressForm onSave={() => true} />);
    input("Número", "100");
    input("Complemento (opcional)", "Sala 5");
    input("CEP", "01001-000");
    await waitFor(() =>
      expect(screen.getByLabelText("Rua / Logradouro")).toHaveValue("Praça da Sé"),
    );
    expect(screen.getByLabelText("CEP")).toHaveValue("01001-000");
    expect(screen.getByLabelText("Número")).toHaveValue("100");
    expect(screen.getByLabelText("Complemento (opcional)")).toHaveValue("Sala 5");
    fireEvent.click(screen.getByRole("button", { name: "Consultar CEP" }));
    await waitFor(() => expect(lookup).toHaveBeenCalledTimes(2));
  });
  it("não pesquisa CEP incompleto", async () => {
    const lookup = vi.spyOn(cep, "lookupCep");
    render(<AddressForm onSave={() => true} />);
    input("CEP", "01001");
    await new Promise((r) => setTimeout(r, 350));
    expect(lookup).not.toHaveBeenCalled();
  });
  it("ignora respostas fora de ordem e cancela a consulta antiga", async () => {
    let firstResolve!: (value: cep.CepResult) => void;
    const lookup = vi
      .spyOn(cep, "lookupCep")
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            firstResolve = resolve;
          }),
      )
      .mockResolvedValueOnce({
        street: "Rua Nova",
        neighborhood: "Novo Bairro",
        city: "Nova Cidade",
        uf: "RJ",
      });
    render(<AddressForm onSave={() => true} />);
    input("CEP", "01001000");
    await waitFor(() => expect(lookup).toHaveBeenCalledTimes(1));
    const signal = lookup.mock.calls[0]![1];
    input("CEP", "20040002");
    await waitFor(() => expect(screen.getByLabelText("Rua / Logradouro")).toHaveValue("Rua Nova"));
    firstResolve({ street: "Rua Antiga", neighborhood: "Antigo", city: "Antiga", uf: "SP" });
    await waitFor(() => expect(screen.getByLabelText("Rua / Logradouro")).toHaveValue("Rua Nova"));
    expect(signal?.aborted).toBe(true);
  });
  it("invalida campos automáticos ao trocar CEP mas preserva edições manuais", async () => {
    vi.spyOn(cep, "lookupCep").mockResolvedValue({
      street: "Rua Antiga",
      neighborhood: "Antigo",
      city: "São Paulo",
      uf: "SP",
    });
    render(<AddressForm onSave={() => true} />);
    input("CEP", "01001000");
    await waitFor(() =>
      expect(screen.getByLabelText("Rua / Logradouro")).toHaveValue("Rua Antiga"),
    );
    input("Bairro", "Bairro Manual");
    input("CEP", "200");
    expect(screen.getByLabelText("Rua / Logradouro")).toHaveValue("");
    expect(screen.getByLabelText("Bairro")).toHaveValue("Bairro Manual");
  });
  it("permite preenchimento manual após falha", async () => {
    vi.spyOn(cep, "lookupCep").mockRejectedValue(new Error("Offline"));
    const save = vi.fn((_value: import("@/types/models").Address) => true);
    render(<AddressForm onSave={save} />);
    input("CEP", "01001000");
    await screen.findByText(/Não foi possível consultar/);
    input("Rua / Logradouro", "Rua Manual");
    input("Número", "123");
    input("Bairro", "Sé");
    input("Cidade", "São Paulo");
    fireEvent.click(screen.getByRole("button", { name: "Salvar endereço" }));
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect(save.mock.calls[0]![0]).toMatchObject({
      street: "Rua Manual",
      number: "123",
      complement: "",
    });
  });
  it("exige número ou sem número, aceita complemento vazio e edição", () => {
    expect(addressSchema.safeParse({ ...testAddress, number: "", complement: "" }).success).toBe(
      false,
    );
    expect(
      addressSchema.safeParse({ ...testAddress, number: "", noNumber: true, complement: "" })
        .success,
    ).toBe(true);
    expect(addressSchema.safeParse({ ...testAddress, street: "Rua Atualizada" }).success).toBe(
      true,
    );
  });
});
