import { mockProducts } from "@/data/mockProducts";
const AdminCharts = lazy(() =>
  import("@/components/admin/AdminCharts").then((module) => ({ default: module.AdminCharts })),
);
import { BackupPanel } from "@/components/admin/BackupPanel";
import { ProductionPanel } from "@/components/admin/ProductionPanel";
import { DeliveryAdmin } from "@/components/admin/DeliveryAdmin";
import { CatalogAdmin, type CatalogKind } from "@/components/admin/CatalogAdmin";
import { whatsappUrl } from "@/services/whatsapp";
import { useState, Suspense, lazy, type FormEvent } from "react";
import {
  BarChart3,
  Package,
  CalendarDays,
  Users,
  Receipt,
  Settings,
  Truck,
  LogOut,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { brl, CATEGORIES, type Meal, type Plan } from "@/lib/menu";
import { STATUS, statuses, mealSchema, planSchema, type Customer } from "@/data/demo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
type Tab =
  | "Dashboard"
  | "Produtos"
  | "Planos"
  | "Pedidos"
  | "Clientes"
  | "Entregas"
  | "Relatórios"
  | "Configurações"
  | CatalogKind
  | "Produção"
  | "Backup";
type Editor =
  | { kind: "product"; value: Meal }
  | { kind: "plan"; value: Plan }
  | { kind: "customer"; value: Customer };
const tabs = [
  { label: "Dashboard", icon: BarChart3 },
  { label: "Produtos", icon: Package },
  { label: "Planos", icon: CalendarDays },
  { label: "Pedidos", icon: Receipt },
  { label: "Clientes", icon: Users },
  { label: "Entregas", icon: Truck },
  { label: "Relatórios", icon: BarChart3 },
  { label: "Configurações", icon: Settings },
  { label: "Categorias", icon: Package },
  { label: "Cupons", icon: Receipt },
  { label: "Zonas", icon: Truck },
  { label: "Horários", icon: CalendarDays },
  { label: "Produção", icon: Package },
  { label: "Backup", icon: Settings },
] as const;
export default function Admin() {
  const store = useCart();
  const [entered, setEntered] = useState(false);
  const [tab, setTab] = useState<Tab>("Dashboard");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [settings, setSettings] = useState(store.settings);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const activeOrders = store.orders.filter((o) => o.status !== "cancelado");
  const volume = activeOrders.reduce((n, o) => n + o.total, 0);
  const cards = [
    ["Pedidos locais", store.orders.length],
    ["Valor dos pedidos", brl(volume)],
    ["Ticket médio", brl(activeOrders.length ? volume / activeOrders.length : 0)],
    ["Em preparo", store.orders.filter((o) => o.status === "em_preparo").length],
  ];
  function remove(kind: Editor["kind"], id: string) {
    if (!window.confirm("Excluir este registro local? Pedidos anteriores manterão seus dados."))
      return;
    const ok = store.update((s) => {
      if (kind === "product") {
        const items = { ...s.items };
        delete items[id];
        return {
          ...s,
          meals: s.meals.filter((m) => m.id !== id),
          items,
          favorites: s.favorites.filter((v) => v !== id),
          planner: s.planner.filter((p) => p.mealId !== id),
        };
      }
      if (kind === "plan")
        return {
          ...s,
          plans: s.plans.filter((p) => p.id !== id),
          planId: s.planId === id ? undefined : s.planId,
        };
      return { ...s, customers: s.customers.filter((c) => c.id !== id) };
    });
    if (ok) setNotice("Registro excluído.");
  }
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editor) return;
    const data = new FormData(e.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    let next: Editor;
    if (editor.kind === "product") {
      const parsed = mealSchema.safeParse({
        ...editor.value,
        name: text("name"),
        description: text("description"),
        price: Number(text("price")),
        category: text("category"),
        image: text("image"),
        ingredients: text("ingredients")
          .split(";")
          .map((v) => v.trim())
          .filter(Boolean),
        allergens: text("allergens"),
        ...Object.fromEntries(
          ["weight", "kcal", "protein", "carbs", "fat"].map((k) => [
            k,
            k !== "weight" && text(k) === "" ? null : Number(text(k)),
          ]),
        ),
      });
      if (!parsed.success) {
        setError("Verifique nome, descrição, preço e os valores nutricionais.");
        return;
      }
      next = { kind: "product", value: parsed.data };
    } else if (editor.kind === "plan") {
      const parsed = planSchema.safeParse({
        ...editor.value,
        name: text("name"),
        description: text("description"),
        pricePerMeal: Number(text("pricePerMeal")),
        meals: Number(text("meals")),
      });
      if (!parsed.success) {
        setError("Verifique nome, quantidade (1–50) e preço.");
        return;
      }
      next = { kind: "plan", value: parsed.data };
    } else {
      if (
        text("name").length < 2 ||
        text("address").length < 8 ||
        !/^\d{10,13}$/.test(text("phone").replace(/\D/g, ""))
      ) {
        setError("Informe nome, telefone e endereço válidos.");
        return;
      }
      next = {
        kind: "customer",
        value: {
          id: editor.value.id,
          name: text("name"),
          phone: text("phone"),
          address: text("address"),
        },
      };
    }
    if (
      next.kind === "product"
        ? store.repositories.products.save(next.value)
        : next.kind === "plan"
          ? store.repositories.plans.save(next.value)
          : store.repositories.customers.save(next.value)
    ) {
      setEditor(null);
      setNotice("Alterações salvas neste dispositivo.");
    }
  }
  function open(value: Editor) {
    setError("");
    setEditor(value);
  }
  function add() {
    const id = crypto.randomUUID();
    if (tab === "Produtos" && !store.categories.length) {
      setNotice("Cadastre uma categoria antes de adicionar produtos.");
      return;
    }
    if (tab === "Produtos")
      open({
        kind: "product",
        value: {
          ...mockProducts[0]!,
          category: store.categories[0]?.name ?? "Frango",
          id,
          name: "",
          description: "",
          price: 0,
          kcal: null,
          protein: null,
          carbs: null,
          fat: null,
          ingredients: [],
          allergens: "Informação não cadastrada.",
          active: true,
        },
      });
    if (tab === "Planos")
      open({ kind: "plan", value: { id, name: "", description: "", meals: 5, pricePerMeal: 20 } });
    if (tab === "Clientes")
      open({ kind: "customer", value: { id, name: "", phone: "", address: "" } });
  }
  function exportReport() {
    const rows = [
      ["Pedido", "Data", "Cliente", "Status", "Total"],
      ...store.orders.map((o) => [o.id, o.createdAt, o.name, STATUS[o.status], String(o.total)]),
    ];
    const csv =
      "\uFEFF" +
      rows
        .map((r) =>
          r.map((v) => '"' + v.replace(/^[=+@-]/, "'").replaceAll('"', '""') + '"').join(";"),
        )
        .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "freshbites-relatorio-local.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  if (!entered)
    return (
      <section className="page space-y-4">
        <h1>Admin demonstrativo</h1>
        <p>
          Este painel não possui autenticação segura. Qualquer pessoa com acesso a este dispositivo
          pode alterar os dados locais.
        </p>
        <p>Clientes e pedidos marcados como DEMO são fictícios.</p>
        <button className="btn" onClick={() => setEntered(true)}>
          Entrar na demonstração
        </button>
      </section>
    );
  const matches = (name: string) => name.toLocaleLowerCase().includes(query.toLocaleLowerCase());
  return (
    <section className="admin-page px-4 pt-5 md:px-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-primary-strong">FRESHBITES • ADMIN LOCAL</p>
          <h1>{tab}</h1>
        </div>
        <button className="btn-secondary gap-2" onClick={() => setEntered(false)}>
          <LogOut size={16} />
          Sair
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        Demonstração sem segurança real • alterações apenas neste navegador
      </p>
      <div className="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
        <nav
          aria-label="Administração"
          className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-y-auto md:max-h-[calc(100dvh-100px)] md:self-start md:sticky md:top-20"
        >
          {tabs.map((t) => (
            <button
              key={t.label}
              onClick={() => {
                setTab(t.label);
                if (t.label === "Configurações") setSettings(store.settings);
                setQuery("");
                setNotice("");
              }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 min-h-11 text-sm font-bold ${tab === t.label ? "bg-primary-strong text-white" : "border bg-card"}`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="min-w-0 space-y-5">
          {notice && <p role="status">{notice}</p>}
          {(tab === "Dashboard" || tab === "Relatórios") && (
            <>
              <Suspense
                fallback={
                  <p role="status" className="panel animate-pulse">
                    Carregando gráficos locais…
                  </p>
                }
              >
                <AdminCharts />
              </Suspense>
              <button className="btn-secondary" onClick={exportReport}>
                Exportar relatório CSV
              </button>
            </>
          )}
          {["Produtos", "Planos", "Clientes"].includes(tab) && (
            <>
              <div className="flex flex-wrap justify-between gap-3">
                <h2>Gestão de {tab.toLowerCase()}</h2>
                <button className="btn gap-2" onClick={add}>
                  <Plus size={18} />
                  Adicionar
                </button>
              </div>
              <label>
                Buscar
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Buscar ${tab.toLowerCase()}`}
                />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                {(tab === "Produtos"
                  ? store.meals
                  : tab === "Planos"
                    ? store.plans
                    : store.customers
                )
                  .filter((v) => matches(v.name))
                  .map((v) => (
                    <article key={v.id} className="panel space-y-2">
                      <h2>{v.name}</h2>
                      {"price" in v && (
                        <p>
                          {brl(v.price)} • {v.category}
                        </p>
                      )}
                      {"meals" in v && (
                        <p>
                          {v.meals} marmitas • {brl(v.pricePerMeal)} cada
                        </p>
                      )}
                      {"phone" in v && (
                        <>
                          <p>{v.phone}</p>
                          <p>{v.address}</p>
                        </>
                      )}
                      {tab !== "Clientes" && (
                        <p className="text-xs">
                          {"active" in v && v.active === false ? "Inativo" : "Ativo"}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="btn-secondary gap-2"
                          onClick={() =>
                            open(
                              tab === "Produtos"
                                ? { kind: "product", value: v as Meal }
                                : tab === "Planos"
                                  ? { kind: "plan", value: v as Plan }
                                  : { kind: "customer", value: v as Customer },
                            )
                          }
                        >
                          <Pencil size={16} />
                          Editar
                        </button>
                        {tab !== "Clientes" && (
                          <button
                            className="btn-secondary"
                            onClick={() =>
                              store.update((s) =>
                                tab === "Produtos"
                                  ? {
                                      ...s,
                                      meals: s.meals.map((m) =>
                                        m.id === v.id ? { ...m, active: m.active === false } : m,
                                      ),
                                    }
                                  : {
                                      ...s,
                                      plans: s.plans.map((p) =>
                                        p.id === v.id ? { ...p, active: p.active === false } : p,
                                      ),
                                    },
                              )
                            }
                          >
                            {"active" in v && v.active === false ? "Ativar" : "Inativar"}
                          </button>
                        )}
                        <button
                          aria-label={`Excluir ${v.name}`}
                          className="btn-secondary text-destructive"
                          onClick={() =>
                            remove(
                              tab === "Produtos"
                                ? "product"
                                : tab === "Planos"
                                  ? "plan"
                                  : "customer",
                              v.id,
                            )
                          }
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
              {!(
                tab === "Produtos" ? store.meals : tab === "Planos" ? store.plans : store.customers
              ).some((v) => matches(v.name)) && <p>Nenhum registro encontrado.</p>}
            </>
          )}
          {tab === "Pedidos" && (
            <>
              <label>
                Buscar por nome ou identificador
                <input value={query} onChange={(e) => setQuery(e.target.value)} />
              </label>
              <label>
                Filtrar por status
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">Todos</option>
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {STATUS[s]}
                    </option>
                  ))}
                </select>
              </label>
              <button className="btn-secondary" onClick={exportReport}>
                Exportar pedidos CSV
              </button>
              {store.orders
                .filter(
                  (o) =>
                    matches(o.name + " " + o.id) && (!statusFilter || o.status === statusFilter),
                )
                .map((o) => (
                  <article className="panel space-y-3" key={o.id}>
                    <p className="text-xs break-all">#{o.id}</p>
                    <h2>{o.name}</h2>
                    <p>{o.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}</p>
                    <p>{o.address}</p>
                    <p>{brl(o.total)} • Pagamento manual</p>
                    <a
                      className="btn-secondary"
                      href={whatsappUrl(o, store.settings.whatsapp)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir WhatsApp
                    </a>
                    <details>
                      <summary className="min-h-11 py-3 cursor-pointer">Detalhes do pedido</summary>
                      <p>Contato: {o.phone}</p>
                      <p>Entrega: {o.deliveryDate}</p>
                      <p>Observações: {o.observations || "Nenhuma"}</p>
                      <p>
                        Subtotal: {brl(o.subtotal)} • Desconto: {brl(o.discount)} • Frete:{" "}
                        {brl(o.delivery)}
                      </p>
                    </details>
                    <label>
                      Status do pedido
                      <select
                        value={o.status}
                        onChange={(e) => {
                          const status = statuses.find((s) => s === e.target.value);
                          if (status) store.setOrderStatus(o.id, status);
                        }}
                      >
                        {statuses.map((s) => (
                          <option value={s} key={s}>
                            {STATUS[s]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </article>
                ))}
              {!store.orders.some((o) => matches(o.name + " " + o.id)) && (
                <p>Nenhum pedido encontrado.</p>
              )}
            </>
          )}
          {tab === "Entregas" && <DeliveryAdmin />}
          {tab === "Produção" && <ProductionPanel />}
          {tab === "Backup" && <BackupPanel />}
          {(["Categorias", "Cupons", "Zonas", "Horários"] as string[]).includes(tab) && (
            <CatalogAdmin key={tab} kind={tab as CatalogKind} />
          )}
          {tab === "Configurações" && (
            <form
              className="max-w-lg space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (store.update((s) => ({ ...s, settings }))) setNotice("Configurações salvas.");
              }}
            >
              <label>
                Nome da loja
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                />
              </label>
              <label>
                WhatsApp da loja (país + DDD + número)
                <input
                  required
                  pattern="[0-9]{10,15}"
                  inputMode="numeric"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                />
              </label>
              <p className="text-sm">
                O número inicial é fictício. Configure o destino antes de enviar pedidos reais.
              </p>
              <label>
                Taxa de entrega (R$)
                <input
                  type="number"
                  min="0"
                  max="100000"
                  step="0.01"
                  required
                  value={settings.deliveryFee}
                  onChange={(e) =>
                    setSettings({ ...settings, deliveryFee: Number(e.target.value) })
                  }
                />
              </label>
              <button className="btn">Salvar configurações</button>
            </form>
          )}
        </div>
      </div>
      <Sheet
        open={!!editor}
        onOpenChange={(v) => {
          if (!v) setEditor(null);
        }}
      >
        <SheetContent
          side="bottom"
          className="mx-auto max-w-2xl max-h-[90dvh] overflow-y-auto rounded-t-3xl pb-safe"
        >
          <SheetHeader>
            <SheetTitle>
              {editor?.kind === "product"
                ? "Editar produto"
                : editor?.kind === "plan"
                  ? "Editar plano"
                  : "Editar cliente"}
            </SheetTitle>
            <SheetDescription>Alterações salvas somente neste dispositivo.</SheetDescription>
          </SheetHeader>
          {editor && (
            <form key={editor.value.id} onSubmit={save} className="admin-page space-y-3 p-4">
              <label>
                Nome
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={150}
                  defaultValue={editor.value.name}
                />
              </label>
              {editor.kind === "product" ? (
                <>
                  <label>
                    Descrição
                    <textarea
                      name="description"
                      required
                      minLength={2}
                      defaultValue={editor.value.description}
                    />
                  </label>
                  <label>
                    Preço (R$)
                    <input
                      name="price"
                      type="number"
                      required
                      min="0"
                      max="100000"
                      step="0.01"
                      defaultValue={editor.value.price}
                    />
                  </label>
                  <label>
                    Categoria
                    <select name="category" defaultValue={editor.value.category}>
                      {store.categories.map(({ name: c }) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Ingredientes (separados por ;)
                    <textarea
                      name="ingredients"
                      defaultValue={(editor.value.ingredients ?? []).join("; ")}
                    />
                  </label>
                  <label>
                    Alérgenos — informar quando desconhecidos
                    <textarea
                      name="allergens"
                      defaultValue={editor.value.allergens ?? "Informação não cadastrada."}
                    />
                  </label>
                  <p className="text-xs">
                    Deixe campos nutricionais sem informação em branco. Não estimamos valores
                    ausentes.
                  </p>
                  <label>
                    Foto
                    <select name="image" defaultValue={editor.value.image}>
                      {[...new Set([...store.meals, ...mockProducts].map((m) => m.image))].map(
                        (src, i) => (
                          <option key={src} value={src}>
                            Foto de marmita {i + 1}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["weight", "kcal", "protein", "carbs", "fat"] as const).map((k, i) => (
                      <label key={k}>
                        {
                          [
                            "Peso (g)",
                            "Calorias",
                            "Proteína (g)",
                            "Carboidratos (g)",
                            "Gordura (g)",
                          ][i]
                        }
                        <input
                          name={k}
                          type="number"
                          required={k === "weight"}
                          placeholder="Não informado"
                          min="0"
                          max="100000"
                          step="0.1"
                          defaultValue={editor.value[k] ?? ""}
                        />
                      </label>
                    ))}
                  </div>
                </>
              ) : editor.kind === "plan" ? (
                <>
                  <label>
                    Descrição
                    <textarea name="description" defaultValue={editor.value.description} />
                  </label>
                  <label>
                    Quantidade de marmitas
                    <input
                      name="meals"
                      type="number"
                      min="1"
                      max="50"
                      required
                      defaultValue={editor.value.meals}
                    />
                  </label>
                  <label>
                    Preço por marmita (R$)
                    <input
                      name="pricePerMeal"
                      type="number"
                      min="0"
                      max="100000"
                      step="0.01"
                      required
                      defaultValue={editor.value.pricePerMeal}
                    />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Telefone
                    <input name="phone" type="tel" required defaultValue={editor.value.phone} />
                  </label>
                  <label>
                    Endereço
                    <textarea
                      name="address"
                      minLength={8}
                      required
                      defaultValue={editor.value.address}
                    />
                  </label>
                </>
              )}
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
