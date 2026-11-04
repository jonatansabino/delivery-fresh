import { z } from "zod";
const responseSchema = z.object({
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  bairro: z.string().optional(),
  localidade: z.string().optional(),
  uf: z.string().optional(),
  erro: z.union([z.boolean(), z.string()]).optional(),
});
export interface CepResult {
  street: string;
  neighborhood: string;
  city: string;
  uf: string;
}
const cache = new Map<string, { date: number; data: CepResult }>();
export const maskCep = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, "$1-$2");
export async function lookupCep(value: string, signal?: AbortSignal): Promise<CepResult> {
  if (!/^\d{5}-?\d{3}$/.test(value)) throw new Error("CEP deve conter oito dígitos.");
  const cep = value.replace("-", "");
  const existing = cache.get(cep);
  if (existing && Date.now() - existing.date < 86400000) return existing.data;
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    ...(signal ? { signal } : {}),
    referrerPolicy: "no-referrer",
  });
  if (!response.ok)
    throw new Error(
      "Não foi possível consultar o CEP agora. Você pode preencher o endereço manualmente.",
    );
  const data = responseSchema.parse(await response.json());
  if (data.erro === true || data.erro === "true")
    throw new Error(
      "CEP não encontrado. Confira o número informado ou preencha o endereço manualmente.",
    );
  const result = {
    street: data.logradouro ?? "",
    neighborhood: data.bairro ?? "",
    city: data.localidade ?? "",
    uf: data.uf ?? "",
  };
  cache.set(cep, { date: Date.now(), data: result });
  return result;
}
export function clearCepCache() {
  cache.clear();
}
