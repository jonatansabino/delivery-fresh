import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { lookupCep, maskCep, clearCepCache } from "@/services/cep";
const response = (data: unknown) => ({ ok: true, json: async () => data });
beforeEach(() => clearCepCache());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
describe("Consulta ViaCEP", () => {
  it("consulta CEP válido com máscara e reutiliza o cache", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        response({ logradouro: "Praça da Sé", bairro: "Sé", localidade: "São Paulo", uf: "SP" }),
      );
    vi.stubGlobal("fetch", fetcher);
    expect((await lookupCep("01001-000")).street).toBe("Praça da Sé");
    await lookupCep("01001000");
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0]![0]).toBe("https://viacep.com.br/ws/01001000/json/");
  });
  it.each(["123", "123456789", "ABC01000", ""])(
    "não consulta CEP inválido ou incompleto %s",
    async (cep) => {
      const fetcher = vi.fn();
      vi.stubGlobal("fetch", fetcher);
      await expect(lookupCep(cep)).rejects.toThrow("oito dígitos");
      expect(fetcher).not.toHaveBeenCalled();
    },
  );
  it("trata CEP inexistente", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ erro: true })));
    await expect(lookupCep("99999999")).rejects.toThrow("CEP não encontrado");
  });
  it.each([{ bairro: "Sé" }, { logradouro: "Praça da Sé" }, {}])(
    "preserva campos ausentes sem inventar dados %o",
    async (fields) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(response({ ...fields, localidade: "São Paulo", uf: "SP" })),
      );
      const result = await lookupCep("01001000");
      expect(result.street).toBe("logradouro" in fields ? fields.logradouro : "");
      expect(result.neighborhood).toBe("bairro" in fields ? fields.bairro : "");
    },
  );
  it("trata resposta HTTP de erro", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(lookupCep("01001000")).rejects.toThrow("preencher o endereço manualmente");
  });
  it("propaga falha de conexão para tratamento no formulário", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Offline")));
    await expect(lookupCep("01001000")).rejects.toThrow("Offline");
  });
  it("limita e aplica a máscara", () => {
    expect(maskCep("01001000999abc")).toBe("01001-000");
  });
});
