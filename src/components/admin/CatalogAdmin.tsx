import { useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart";
import { categorySchema, couponSchema, zoneSchema, slotSchema } from "@/types/models";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
export type CatalogKind = "Categorias" | "Cupons" | "Zonas" | "Horários";
interface Field {
  key: string;
  label: string;
  type?: "number" | "date" | "text";
  step?: string;
  min?: number;
  max?: number;
  choices?: string[];
}
const config: Record<CatalogKind, Field[]> = {
  Categorias: [{ key: "name", label: "Nome da categoria" }],
  Cupons: [
    { key: "code", label: "Código" },
    { key: "type", label: "Tipo de desconto", choices: ["percent", "fixed"] },
    { key: "value", label: "Valor do desconto", type: "number", min: 0, max: 100000, step: "0.01" },
    {
      key: "minPurchase",
      label: "Compra mínima (R$)",
      type: "number",
      min: 0,
      max: 100000,
      step: "0.01",
    },
    { key: "expiresAt", label: "Validade", type: "date" },
    { key: "limit", label: "Limite de utilização local", type: "number", min: 1, max: 10000 },
  ],
  Zonas: [
    { key: "city", label: "Cidade" },
    { key: "neighborhood", label: "Bairro" },
    {
      key: "uf",
      label: "UF",
      choices: [
        "AC",
        "AL",
        "AP",
        "AM",
        "BA",
        "CE",
        "DF",
        "ES",
        "GO",
        "MA",
        "MT",
        "MS",
        "MG",
        "PA",
        "PB",
        "PR",
        "PE",
        "PI",
        "RJ",
        "RN",
        "RS",
        "RO",
        "RR",
        "SC",
        "SP",
        "SE",
        "TO",
      ],
    },
    { key: "fee", label: "Frete simulado (R$)", type: "number", min: 0, max: 100000, step: "0.01" },
    { key: "estimate", label: "Prazo estimado demonstrativo" },
  ],
  Horários: [
    {
      key: "weekday",
      label: "Dia da semana (0=Domingo a 6=Sábado)",
      type: "number",
      min: 0,
      max: 6,
    },
    { key: "label", label: "Faixa de horário" },
  ],
};
export function CatalogAdmin({ kind }: { kind: CatalogKind }) {
  const store = useCart();
  const [editor, setEditor] = useState<{
    id: string;
    values: Record<string, string | number | boolean>;
  } | null>(null);
  const [error, setError] = useState("");
  const entries =
    kind === "Categorias"
      ? store.categories.map((v) => ({
          id: v.id,
          name: v.name,
          active: v.active,
          values: { ...v },
        }))
      : kind === "Cupons"
        ? store.coupons.map((v) => ({
            id: v.code,
            name: `${v.code} — ${v.type === "percent" ? `${v.value}%` : `R$ ${v.value}`} • usados: ${store.usedCoupons[v.code] ?? 0}/${v.limit}`,
            active: v.active,
            values: { ...v },
          }))
        : kind === "Zonas"
          ? store.deliveryZones.map((v) => ({
              id: v.id,
              name: `${v.neighborhood} — ${v.city}/${v.uf} • R$ ${v.fee}`,
              active: v.active,
              values: { ...v },
            }))
          : store.deliverySlots.map((v) => ({
              id: v.id,
              name: `${["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][v.weekday]} • ${v.label}`,
              active: v.active,
              values: { ...v },
            }));
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editor) return;
    const data = new FormData(e.currentTarget);
    const raw: Record<string, unknown> = {
      id: editor.id || crypto.randomUUID(),
      active: data.get("active") === "on",
    };
    for (const field of config[kind])
      raw[field.key] =
        field.type === "number"
          ? Number(data.get(field.key))
          : String(data.get(field.key) ?? "").trim();
    if (kind === "Categorias") {
      const result = categorySchema.safeParse(raw);
      if (!result.success) {
        setError("Informe um nome válido.");
        return;
      }
      const old = store.categories.find((c) => c.id === editor.id);
      if (
        store.categories.some(
          (c) => c.id !== editor.id && c.name.toLowerCase() === result.data.name.toLowerCase(),
        )
      ) {
        setError("Já existe uma categoria com este nome.");
        return;
      }
      if (
        store.update((s) => ({
          ...s,
          categories: [...s.categories.filter((c) => c.id !== editor.id), result.data],
          meals: s.meals.map((m) =>
            old && m.category === old.name ? { ...m, category: result.data.name } : m,
          ),
        }))
      )
        setEditor(null);
    } else if (kind === "Cupons") {
      raw["code"] = String(raw["code"]).toUpperCase();
      const result = couponSchema.safeParse(raw);
      if (!result.success) {
        setError("Verifique código, percentual (0–100), valor, data e limite.");
        return;
      }
      if (store.coupons.some((c) => c.code === result.data.code && c.code !== editor.id)) {
        setError("Já existe um cupom com este código.");
        return;
      }
      if (
        store.update((s) => ({
          ...s,
          coupons: [...s.coupons.filter((c) => c.code !== editor.id), result.data],
        }))
      )
        setEditor(null);
    } else if (kind === "Zonas") {
      const result = zoneSchema.safeParse(raw);
      if (!result.success) {
        setError("Informe bairro, cidade, UF e frete válidos.");
        return;
      }
      if (
        store.update((s) => ({
          ...s,
          deliveryZones: [...s.deliveryZones.filter((v) => v.id !== editor.id), result.data],
        }))
      )
        setEditor(null);
    } else {
      const result = slotSchema.safeParse(raw);
      if (!result.success) {
        setError("Informe um dia entre 0 e 6 e uma faixa de horário.");
        return;
      }
      if (
        store.update((s) => ({
          ...s,
          deliverySlots: [...s.deliverySlots.filter((v) => v.id !== editor.id), result.data],
        }))
      )
        setEditor(null);
    }
  }
  function remove(id: string) {
    if (
      kind === "Categorias" &&
      store.meals.some((m) => m.category === store.categories.find((c) => c.id === id)?.name)
    ) {
      setError("Esta categoria possui produtos. Mova os produtos antes de excluir.");
      return;
    }
    if (!window.confirm("Excluir este registro demonstrativo?")) return;
    store.update((s) =>
      kind === "Categorias"
        ? { ...s, categories: s.categories.filter((c) => c.id !== id) }
        : kind === "Cupons"
          ? { ...s, coupons: s.coupons.filter((c) => c.code !== id) }
          : kind === "Zonas"
            ? { ...s, deliveryZones: s.deliveryZones.filter((c) => c.id !== id) }
            : { ...s, deliverySlots: s.deliverySlots.filter((c) => c.id !== id) },
    );
  }
  return (
    <section className="space-y-4">
      <h2>Gestão de {kind.toLowerCase()}</h2>
      <button
        className="btn"
        onClick={() => {
          setError("");
          setEditor({
            id: "",
            values: {
              active: true,
              type: "percent",
              value: 10,
              minPurchase: 0,
              limit: 10,
              expiresAt: "2027-12-31",
              uf: "SP",
              fee: 7.9,
              weekday: 1,
            },
          });
        }}
      >
        Adicionar{" "}
        {kind === "Categorias"
          ? "categoria"
          : kind === "Cupons"
            ? "cupom"
            : kind === "Zonas"
              ? "zona"
              : "horário"}
      </button>
      {error && !editor && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {!entries.length && <p>Nenhum registro cadastrado.</p>}
      {entries.map((v) => (
        <article className="panel space-y-3" key={v.id}>
          <h3 className="font-bold">{v.name}</h3>
          <p className="text-xs">
            {v.active ? "Ativo" : "Inativo"}
            {kind === "Cupons" ? " • Uso exclusivamente demonstrativo" : ""}
          </p>
          <div className="flex gap-2">
            <button
              className="btn-secondary"
              onClick={() => {
                setError("");
                setEditor({ id: v.id, values: v.values });
              }}
            >
              Editar
            </button>
            <button className="btn-secondary text-destructive" onClick={() => remove(v.id)}>
              Excluir
            </button>
          </div>
        </article>
      ))}
      <Sheet
        open={!!editor}
        onOpenChange={(open) => {
          if (!open) setEditor(null);
        }}
      >
        <SheetContent
          side="bottom"
          className="max-w-2xl mx-auto max-h-[90dvh] overflow-y-auto rounded-t-3xl"
        >
          <SheetHeader>
            <SheetTitle>Editar {kind.toLowerCase()}</SheetTitle>
            <SheetDescription>Configuração local da demonstração.</SheetDescription>
          </SheetHeader>
          {editor && (
            <form className="admin-page space-y-3 p-4" onSubmit={save}>
              {config[kind].map((f) => (
                <label key={f.key}>
                  {f.label}
                  {f.choices ? (
                    <select
                      name={f.key}
                      defaultValue={String(editor.values[f.key] ?? f.choices[0])}
                    >
                      {f.choices.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name={f.key}
                      type={f.type ?? "text"}
                      step={f.step ?? "1"}
                      min={f.min}
                      max={f.max}
                      required
                      maxLength={150}
                      defaultValue={String(editor.values[f.key] ?? "")}
                    />
                  )}
                </label>
              ))}
              <label className="flex! items-center gap-3">
                <input
                  type="checkbox"
                  name="active"
                  className="checkbox"
                  defaultChecked={editor.values["active"] === true}
                />
                Ativo
              </label>
              {error && (
                <p role="alert" className="text-destructive">
                  {error}
                </p>
              )}
              <button className="btn w-full">Salvar alterações</button>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
}
