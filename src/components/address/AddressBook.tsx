import { useState } from "react";
import { useCart } from "@/lib/cart";
import { AddressForm } from "./AddressForm";
import { formatAddress } from "@/services/delivery";
import type { Address } from "@/types/models";
export function AddressBook({ checkout = false }: { checkout?: boolean }) {
  const store = useCart();
  const [editing, setEditing] = useState<Address | undefined>();
  const [open, setOpen] = useState(false);
  function save(value: Address) {
    const success = store.saveAddress(value);
    if (success) {
      setEditing(undefined);
      setOpen(false);
    }
    return success;
  }
  return (
    <section className="space-y-3">
      <h2>{checkout ? "Endereço de entrega" : "Meus endereços"}</h2>
      {!store.addressBook.length && (
        <p className="text-sm">Cadastre um endereço com CEP para consultar o frete simulado.</p>
      )}
      {store.addressBook.map((a) => (
        <article
          className={`panel space-y-2 ${store.selectedAddressId === a.id ? "border-primary-strong" : ""}`}
          key={a.id}
        >
          <h3 className="font-bold">
            {a.label || "Endereço"} {a.primary ? "• Principal" : ""}
          </h3>
          <p className="text-sm">{formatAddress(a)}</p>
          <div className="flex flex-wrap gap-2">
            {checkout && (
              <button
                className="btn-secondary"
                type="button"
                aria-pressed={store.selectedAddressId === a.id}
                onClick={() => store.update((s) => ({ ...s, selectedAddressId: a.id }))}
              >
                {store.selectedAddressId === a.id ? "Selecionado" : "Usar este endereço"}
              </button>
            )}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditing(a);
                setOpen(true);
              }}
            >
              Editar endereço
            </button>
            {!a.primary && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => save({ ...a, primary: true })}
              >
                Definir principal
              </button>
            )}
            <button
              type="button"
              className="btn-secondary text-destructive"
              onClick={() => {
                if (window.confirm("Excluir este endereço local?"))
                  store.update((s) => ({
                    ...s,
                    addressBook: s.addressBook.filter((v) => v.id !== a.id),
                    selectedAddressId: s.selectedAddressId === a.id ? "" : s.selectedAddressId,
                  }));
              }}
            >
              Excluir endereço
            </button>
          </div>
        </article>
      ))}
      {!open ? (
        <button
          className="btn-secondary"
          type="button"
          onClick={() => {
            setEditing(undefined);
            setOpen(true);
          }}
        >
          Adicionar endereço
        </button>
      ) : (
        <div className="panel">
          <h3 className="mb-3 font-bold">{editing ? "Editar endereço" : "Novo endereço"}</h3>
          <AddressForm
            key={editing?.id ?? "new"}
            {...(editing ? { initial: editing } : {})}
            onSave={save}
            onCancel={() => setOpen(false)}
          />
        </div>
      )}
      {store.addresses.length > 0 && !checkout && (
        <details className="panel">
          <summary>Endereços anteriores sem CEP ({store.addresses.length})</summary>
          <p className="text-sm my-2">
            Preservados da versão anterior. Cadastre-os acima para calcular o frete.
          </p>
          {store.addresses.map((a) => (
            <p key={a} className="text-sm">
              {a}
            </p>
          ))}
        </details>
      )}
    </section>
  );
}
