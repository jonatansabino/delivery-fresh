import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { addressSchema, blankAddress, ufList, type Address } from "@/types/models";
import { lookupCep, maskCep } from "@/services/cep";
export function AddressForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Address;
  onSave: (value: Address) => boolean;
  onCancel?: () => void;
}) {
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<Address>({
    resolver: zodResolver(addressSchema),
    defaultValues: initial ?? blankAddress(),
  });
  const cep = watch("cep");
  const noNumber = watch("noNumber");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const auto = useRef<Partial<Pick<Address, "street" | "neighborhood" | "city" | "uf">>>(
    initial
      ? {
          street: initial.street,
          neighborhood: initial.neighborhood,
          city: initial.city,
          uf: initial.uf,
        }
      : {},
  );
  const editing = useRef(Boolean(initial?.cep));
  const [attempt, setAttempt] = useState(0);
  const numberRef = useRef<HTMLInputElement | null>(null);
  const values = watch();
  const latest = useRef(values);
  latest.current = values;
  useEffect(() => {
    if (editing.current) {
      editing.current = false;
      return;
    }
    if (cep.length !== 8) {
      setLoading(false);
      setMessage("");
      return;
    }
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 10000);
    const timer = setTimeout(() => {
      setLoading(true);
      setMessage("");
      const before = { ...latest.current };
      lookupCep(cep, controller.signal)
        .then((result) => {
          if (!active || controller.signal.aborted || latest.current.cep !== cep) return;
          for (const key of ["street", "neighborhood", "city"] as const) {
            if (result[key] && latest.current[key] === before[key]) {
              setValue(key, result[key], { shouldValidate: true });
              auto.current[key] = result[key];
            }
          }
          if (latest.current.uf === before.uf && ufList.includes(result.uf as Address["uf"])) {
            setValue("uf", result.uf as Address["uf"]);
            auto.current.uf = result.uf as Address["uf"];
          }
          setMessage(
            "CEP consultado. Confira os dados e informe o número. Campos vazios podem ser preenchidos manualmente.",
          );
          // Focus only on explicit retry; automatic lookups never steal focus while typing.
          if (attempt > 0) numberRef.current?.focus({ preventScroll: true });
        })
        .catch((e) => {
          if (active)
            setMessage(
              e instanceof Error && e.message.startsWith("CEP não encontrado")
                ? e.message
                : "Não foi possível consultar o CEP agora. Você pode preencher o endereço manualmente.",
            );
        })
        .finally(() => {
          if (active) setLoading(false);
          clearTimeout(timeout);
        });
    }, 300);
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
      clearTimeout(timeout);
    };
  }, [cep, attempt, setValue]);
  const number = register("number");
  const field = (
    key: "street" | "neighborhood" | "city" | "complement" | "reference" | "label",
    label: string,
    required = false,
  ) => (
    <label>
      {label}
      <input
        {...register(key)}
        required={required}
        maxLength={key === "label" ? 50 : 150}
        autoComplete={
          key === "street"
            ? "address-line1"
            : key === "city"
              ? "address-level2"
              : key === "neighborhood"
                ? "address-level3"
                : "off"
        }
      />
      {errors[key] && <span className="text-destructive text-xs">{errors[key]?.message}</span>}
    </label>
  );
  return (
    <form
      className="address-form space-y-3"
      onSubmit={handleSubmit((value) => onSave(value))}
      noValidate
    >
      <label>
        CEP
        <input
          name="cep"
          value={maskCep(cep)}
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={9}
          onChange={(e) => {
            const next = e.target.value.replace(/\D/g, "").slice(0, 8);
            if (next !== cep) {
              for (const key of ["street", "neighborhood", "city"] as const)
                if (auto.current[key] && latest.current[key] === auto.current[key])
                  setValue(key, "");
              if (auto.current.uf && latest.current.uf === auto.current.uf) setValue("uf", "SP");
              auto.current = {};
              setMessage("");
            }
            latest.current = { ...latest.current, cep: next };
            setValue("cep", next, { shouldValidate: false });
          }}
        />
        {errors.cep && <span className="text-xs text-destructive">{errors.cep.message}</span>}
      </label>
      <button
        type="button"
        className="btn-secondary gap-2"
        disabled={cep.length !== 8 || loading}
        onClick={() => setAttempt((n) => n + 1)}
      >
        {loading && <LoaderCircle className="size-4 animate-spin" />}
        {loading ? "Consultando CEP…" : "Consultar CEP"}
      </button>
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
      {field("street", "Rua / Logradouro", true)}
      <div className="grid grid-cols-2 gap-3">
        <label>
          Número
          <input
            {...number}
            ref={(el) => {
              number.ref(el);
              numberRef.current = el;
            }}
            disabled={noNumber}
            maxLength={20}
            inputMode="text"
            autoComplete="address-line2"
          />
          {errors.number && (
            <span className="text-xs text-destructive">{errors.number.message}</span>
          )}
        </label>
        <label className="flex! items-center gap-2">
          <input type="checkbox" className="checkbox" {...register("noNumber")} />
          Sem número
        </label>
      </div>
      {field("complement", "Complemento (opcional)")}
      {field("neighborhood", "Bairro", true)}
      <div className="grid grid-cols-[1fr_90px] gap-3">
        {field("city", "Cidade", true)}
        <label>
          UF
          <select {...register("uf")}>
            {ufList.map((uf) => (
              <option key={uf}>{uf}</option>
            ))}
          </select>
        </label>
      </div>
      {field("reference", "Ponto de referência (opcional)")}
      {field("label", "Apelido do endereço")}
      <label className="flex! items-center gap-2">
        <input className="checkbox" type="checkbox" {...register("primary")} />
        Endereço principal
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn">
          Salvar endereço
        </button>
        {onCancel && (
          <button className="btn-secondary" type="button" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
