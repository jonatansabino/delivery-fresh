import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useCart } from "@/lib/cart";
import { statuses, STATUS } from "@/data/demo";
import { brl } from "@/lib/menu";
const colors = ["#047857", "#f97316", "#0ea5e9", "#a855f7", "#64748b", "#ef4444"];
export function AdminCharts() {
  const store = useCart();
  const orders = store.orders;
  const active = orders.filter((o) => o.status !== "cancelado");
  const confirmed = orders.filter((o) =>
    ["confirmado", "em_preparo", "a_caminho", "entregue"].includes(o.status),
  );
  const cards = [
    ["Pedidos locais", orders.length],
    ["Pendentes", orders.filter((o) => o.status === "aguardando_pagamento").length],
    ["Confirmados (demo)", confirmed.length],
    ["Receita simulada", brl(confirmed.reduce((n, o) => n + o.total, 0))],
    ["Planos solicitados", active.filter((o) => o.planId).length],
    ["Entregas simuladas", orders.filter((o) => o.status === "a_caminho").length],
    ["Produtos cadastrados", store.meals.length],
  ];
  const dayData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + i);
    const matches = orders.filter(
      (o) => new Date(o.createdAt).toLocaleDateString("pt-BR") === date.toLocaleDateString("pt-BR"),
    );
    return {
      name: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      pedidos: matches.length,
      valor: matches.filter((o) => o.status !== "cancelado").reduce((n, o) => n + o.total, 0),
    };
  });
  const productMap = new Map<string, number>();
  for (const o of active)
    for (const item of o.items)
      productMap.set(item.name, (productMap.get(item.name) ?? 0) + item.qty);
  const products = [...productMap]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantidade]) => ({
      name: name.length > 19 ? name.slice(0, 19) + "…" : name,
      quantidade,
    }));
  const planMap = new Map<string, number>();
  for (const o of active.filter((o) => o.planId))
    planMap.set(o.planName ?? o.planId!, (planMap.get(o.planName ?? o.planId!) ?? 0) + o.total);
  const planData = [...planMap].map(([name, valor]) => ({ name, valor }));
  const statusData = statuses
    .map((s) => ({ name: STATUS[s], value: orders.filter((o) => o.status === s).length }))
    .filter((s) => s.value > 0);
  const frame = (title: string, chart: React.ReactElement) => (
    <article className="panel min-w-0">
      <h2 className="mb-4">{title}</h2>
      <div className="h-60 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          {chart}
        </ResponsiveContainer>
      </div>
    </article>
  );
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map(([k, v]) => (
          <div key={k} className="panel">
            <p className="text-xs text-muted-foreground">{k}</p>
            <p className="mt-2 text-xl font-extrabold">{v}</p>
          </div>
        ))}
      </div>
      <p className="text-sm">
        Indicadores fictícios e locais. Receita simulada de pedidos confirmados no modo demo não
        comprova recebimento financeiro.
      </p>
      <div className="grid gap-4 xl:grid-cols-2">
        {frame(
          "Pedidos por dia",
          <BarChart data={dayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={10} />
            <YAxis allowDecimals={false} width={28} />
            <Tooltip />
            <Bar isAnimationActive={false} dataKey="pedidos" fill="#047857" radius={[6, 6, 0, 0]} />
          </BarChart>,
        )}
        {frame(
          "Evolução semanal dos pedidos (R$)",
          <LineChart data={dayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={10} />
            <YAxis width={45} fontSize={10} />
            <Tooltip />
            <Line type="monotone" dataKey="valor" stroke="#f97316" strokeWidth={3} />
          </LineChart>,
        )}
        {frame(
          "Produtos mais escolhidos",
          <BarChart data={products} layout="vertical">
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={105} fontSize={10} />
            <Tooltip />
            <Bar
              isAnimationActive={false}
              dataKey="quantidade"
              fill="#047857"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>,
        )}
        {frame(
          "Valor dos pedidos por plano (R$)",
          <BarChart data={planData}>
            <XAxis dataKey="name" fontSize={10} />
            <YAxis width={45} fontSize={10} />
            <Tooltip />
            <Bar isAnimationActive={false} dataKey="valor" fill="#f97316" radius={[6, 6, 0, 0]} />
          </BarChart>,
        )}
        {frame(
          "Status dos pedidos",
          <PieChart>
            <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
              {statusData.map((d, i) => (
                <Cell key={d.name} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>,
        )}
      </div>
      {!orders.length && <p>Sem pedidos para exibir nos gráficos.</p>}
    </div>
  );
}
