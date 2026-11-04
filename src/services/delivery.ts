import type { Address, DeliveryZone, DeliverySlot } from "@/types/models";
export function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
export function deliveryFor(
  address: Pick<Address, "city" | "neighborhood" | "uf"> | undefined,
  zones: DeliveryZone[],
) {
  return address
    ? zones.find(
        (z) =>
          z.active &&
          normalize(z.city) === normalize(address.city) &&
          normalize(z.neighborhood) === normalize(address.neighborhood) &&
          z.uf === address.uf,
      )
    : undefined;
}
export function formatAddress(a: Address) {
  return `${a.street}, ${a.noNumber ? "s/n" : a.number}${a.complement ? ` — ${a.complement}` : ""}, ${a.neighborhood}, ${a.city}/${a.uf}, CEP ${a.cep.slice(0, 5)}-${a.cep.slice(5)}${a.reference ? ` (Referência: ${a.reference})` : ""}`;
}
export function availableDates(slots: DeliverySlot[], from = new Date()) {
  const dates: { date: string; slot: DeliverySlot }[] = [];
  for (let i = 1; i <= 21; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    for (const slot of slots.filter((s) => s.active && s.weekday === d.getDay()))
      dates.push({ date, slot });
  }
  return dates;
}
