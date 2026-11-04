import { Link } from "react-router-dom";
export function PlanProgress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <nav aria-label="Etapas do plano" className="my-4 grid grid-cols-3 gap-2">
      {[
        { label: "Plano", to: "/planos" },
        { label: "Marmitas", to: "/cardapio" },
        { label: "Revisão", to: "/carrinho" },
      ].map((item, i) => (
        <Link
          key={item.to}
          to={item.to}
          aria-current={step === i + 1 ? "step" : undefined}
          className={`flex min-h-12 items-center justify-center gap-1 rounded-xl px-1 text-xs font-bold ${step === i + 1 ? "bg-primary-strong text-white" : "bg-primary-soft text-primary-strong"}`}
        >
          <span>{i + 1}.</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
