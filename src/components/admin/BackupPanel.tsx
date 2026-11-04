import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { StorageService } from "@/services/storage";
import { initialState, type AppState } from "@/data/demo";
export function downloadText(content: string, name: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function BackupPanel() {
  const store = useCart();
  const [pending, setPending] = useState<AppState | null>(null);
  const [message, setMessage] = useState("");
  return (
    <section className="space-y-4">
      <h2>Backup e restauração</h2>
      <p>
        O arquivo contém dados pessoais locais. Guarde-o em um local de sua confiança. Importar
        substitui os dados deste navegador.
      </p>
      <button
        className="btn"
        onClick={() => downloadText(StorageService.exportData(store), "freshbites-backup-v3.json")}
      >
        Exportar JSON
      </button>
      <label>
        Selecionar backup JSON
        <input
          type="file"
          accept="application/json,.json"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            setPending(null);
            setMessage("");
            if (!file) return;
            if (file.size > 4 * 1024 * 1024) {
              setMessage("Arquivo muito grande. Limite: 4 MB.");
              return;
            }
            try {
              setPending(StorageService.parseImport(await file.text()));
            } catch (error) {
              setMessage(
                error instanceof Error ? error.message : "Não foi possível ler o arquivo.",
              );
            }
            e.target.value = "";
          }}
        />
      </label>
      {pending && (
        <div className="panel space-y-3">
          <h3 className="font-bold">Backup validado • versão 3</h3>
          <p>
            {pending.meals.length} produtos • {pending.orders.length} pedidos •{" "}
            {pending.addressBook.length} endereços
          </p>
          <p>Os dados atuais serão substituídos por este arquivo.</p>
          <button
            className="btn"
            onClick={() => {
              if (store.replaceData(pending)) {
                setPending(null);
                setMessage("Backup importado com sucesso.");
              }
            }}
          >
            Confirmar importação e substituir dados
          </button>
          <button className="btn-secondary ml-2" onClick={() => setPending(null)}>
            Cancelar importação
          </button>
        </div>
      )}
      <div className="panel space-y-3">
        <h3 className="font-bold">Restaurar demonstração</h3>
        <p>Substitui todas as alterações pelos dados iniciais.</p>
        <ConfirmDialog
          label="Restaurar Mock Data"
          title="Restaurar demonstração?"
          description="Todas as alterações locais serão substituídas pelos dados iniciais. Exporte um backup antes de continuar."
          onConfirm={() => {
            if (store.resetDemo()) setMessage("Dados iniciais restaurados.");
          }}
        />
      </div>
      <div className="panel space-y-3">
        <h3 className="font-bold">Limpar dados de uso</h3>
        <p>
          Remove pedidos, clientes, endereços, preferências pessoais, avaliações, favoritos, pontos
          e histórico. Mantém produtos, planos, cupons e zonas cadastrados.
        </p>
        <ConfirmDialog
          label="Limpar dados demonstrativos de uso"
          title="Apagar os dados de uso?"
          description="Esta ação só pode ser desfeita importando um backup. Produtos, planos, cupons e zonas serão mantidos."
          onConfirm={() => {
            if (
              store.update((s) => ({
                ...s,
                items: {},
                planId: undefined,
                coupon: "",
                orders: [],
                customers: [],
                addresses: [],
                addressBook: [],
                selectedAddressId: "",
                favorites: [],
                planner: [],
                cartAddOns: {},
                usedCoupons: {},
                notifications: [],
                reviews: [],
                loyalty: [],
                redeemedRewards: [],
                production: {},
                preferences: structuredClone(initialState.preferences),
                wizard: structuredClone(initialState.wizard),
              }))
            )
              setMessage("Dados de uso removidos.");
          }}
        />
      </div>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
