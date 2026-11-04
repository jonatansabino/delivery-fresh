import { initialState, stateSchema, type AppState } from "@/data/demo";
export const STORAGE_KEY = "freshbites-local-v2"; // Preserve the installed demo's key; payload carries version 3.
const LIMIT = 4 * 1024 * 1024;
function validate(value: unknown): AppState {
  const data = stateSchema.parse(value);
  for (const list of [
    data.meals,
    data.plans,
    data.customers,
    data.addressBook,
    data.orders,
    data.categories,
    data.deliveryZones,
    data.deliverySlots,
    data.loyalty,
    data.notifications,
    data.reviews,
  ]) {
    if (new Set(list.map((x) => x.id)).size !== list.length)
      throw new Error("Identificadores duplicados no arquivo.");
  }
  if (data.meals.some((m) => !data.categories.some((c) => c.name === m.category)))
    throw new Error("Produto com categoria não cadastrada.");
  if (data.addressBook.filter((a) => a.primary).length > 1)
    throw new Error("Só pode haver um endereço principal.");
  if (
    new Set(data.categories.map((c) => c.name.trim().toLowerCase())).size !== data.categories.length
  )
    throw new Error("Categorias duplicadas.");
  if (new Set(data.coupons.map((c) => c.code)).size !== data.coupons.length)
    throw new Error("Cupons duplicados.");
  if (new Set(data.planner.map((p) => p.id)).size !== data.planner.length)
    throw new Error("Planejamento duplicado.");
  return data;
}
export const StorageService = {
  read(): { data: AppState; error: string } {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { data: structuredClone(initialState), error: "" };
      if (raw.length > LIMIT) throw new Error();
      const data = validate(JSON.parse(raw));
      data.items = Object.fromEntries(
        Object.entries(data.items).filter(([id]) => data.meals.some((m) => m.id === id)),
      );
      if (!data.plans.some((p) => p.id === data.planId)) delete data.planId;
      data.favorites = data.favorites.filter((id) => data.meals.some((m) => m.id === id));
      data.planner = data.planner.filter((p) => data.meals.some((m) => m.id === p.mealId));
      return { data, error: "" };
    } catch {
      return {
        data: structuredClone(initialState),
        error:
          "Não foi possível ler os dados locais. A demonstração foi carregada em memória. Exporte ou restaure os dados em Admin → Backup para resolver.",
      };
    }
  },
  write(data: AppState): void {
    const parsed = validate(data);
    try {
      const raw = JSON.stringify(parsed);
      if (raw.length > LIMIT) throw new Error();
      localStorage.setItem(STORAGE_KEY, raw);
    } catch {
      throw new Error(
        "Não foi possível salvar neste dispositivo. Libere espaço ou permita o armazenamento e tente novamente.",
      );
    }
  },
  getItem<K extends keyof AppState>(module: K): AppState[K] {
    return this.read().data[module];
  },
  setItem<K extends keyof AppState>(module: K, value: AppState[K]): void {
    this.write({ ...this.read().data, [module]: value });
  },
  removeItem<K extends keyof AppState>(module: K): void {
    this.setItem(module, structuredClone(initialState[module]));
  },
  clearModule<K extends keyof AppState>(module: K): void {
    this.removeItem(module);
  },
  exportData(data?: AppState): string {
    return JSON.stringify(
      {
        format: "freshbites-fit",
        version: 3,
        exportedAt: new Date().toISOString(),
        data: validate(data ?? StorageService.read().data),
      },
      null,
      2,
    );
  },
  parseImport(raw: string): AppState {
    if (raw.length > LIMIT) throw new Error("Arquivo muito grande. Limite: 4 MB.");
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      throw new Error("Arquivo JSON inválido.");
    }
    if (
      !json ||
      typeof json !== "object" ||
      !("format" in json) ||
      json.format !== "freshbites-fit" ||
      !("version" in json) ||
      json.version !== 3 ||
      !("data" in json)
    )
      throw new Error("Formato ou versão de backup incompatível.");
    try {
      const data = validate(json.data);
      if (Object.keys(data.items).some((id) => !data.meals.some((m) => m.id === id)))
        throw new Error();
      if (data.planner.some((p) => !data.meals.some((m) => m.id === p.mealId))) throw new Error();
      if (data.planId && !data.plans.some((p) => p.id === data.planId)) throw new Error();
      if (data.selectedAddressId && !data.addressBook.some((a) => a.id === data.selectedAddressId))
        throw new Error();
      if (data.favorites.some((id) => !data.meals.some((m) => m.id === id))) throw new Error();
      return data;
    } catch {
      throw new Error("O backup contém dados inválidos. Nenhuma alteração foi aplicada.");
    }
  },
  importData(raw: string): AppState {
    const data = this.parseImport(raw);
    this.write(data);
    return data;
  },
  resetDemoData(): AppState {
    const data = structuredClone(initialState);
    this.write(data);
    return data;
  },
};
