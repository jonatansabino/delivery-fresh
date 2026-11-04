import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { User, Heart, CalendarDays, Gift, Bell, Calculator } from "lucide-react";
import { useCart } from "@/lib/cart";
import { CATEGORIES } from "@/lib/menu";
import { AddressBook } from "@/components/address/AddressBook";
export default function Perfil() {
  const store = useCart();
  const [form, setForm] = useState(store.preferences);
  const [message, setMessage] = useState("");
  function save(e: FormEvent) {
    e.preventDefault();
    if (store.update((s) => ({ ...s, preferences: form })))
      setMessage("Preferências salvas neste dispositivo.");
  }
  return (
    <section className="page space-y-5">
      <User className="size-10 text-primary" />
      <h1>Meu perfil demonstrativo</h1>
      <p>Sem login: seus dados ficam somente neste navegador.</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { to: "/favoritos", label: `Favoritas (${store.favorites.length})`, icon: Heart },
          { to: "/meu-plano", label: "Minha semana", icon: CalendarDays },
          { to: "/freshpoints", label: "FreshPoints", icon: Gift },
          {
            to: "/notificacoes",
            label: `Notificações (${store.notifications.filter((n) => !n.read).length})`,
            icon: Bell,
          },
          { to: "/economia", label: "Simular economia", icon: Calculator },
        ].map(({ to, label, icon: Icon }) => (
          <Link key={to} className="panel flex items-center gap-2 text-sm font-bold" to={to}>
            <Icon className="size-5 shrink-0 text-primary-strong" />
            {label}
          </Link>
        ))}
      </div>
      <form className="space-y-3" onSubmit={save}>
        <label>
          Nome
          <input
            required
            minLength={2}
            maxLength={100}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          WhatsApp
          <input
            type="tel"
            maxLength={20}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
        <label>
          E-mail (opcional)
          <input
            type="email"
            maxLength={150}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Preferência alimentar
          <select value={form.diet} onChange={(e) => setForm({ ...form, diet: e.target.value })}>
            {["Todas", ...CATEGORIES].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Aparência
          <select
            value={form.theme}
            onChange={(e) => {
              const theme = e.target.value as typeof form.theme;
              setForm({ ...form, theme });
              store.update((s) => ({ ...s, preferences: { ...s.preferences, theme } }));
            }}
          >
            <option value="system">Usar tema do dispositivo</option>
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
          </select>
        </label>
        <button className="btn">Salvar preferências</button>
      </form>
      <p role="status">{message}</p>
      <AddressBook />
      <Link className="btn-secondary" to="/pedidos">
        Histórico de pedidos
      </Link>
      <Link to="/admin" className="btn-secondary">
        Administração demonstrativa
      </Link>
    </section>
  );
}
