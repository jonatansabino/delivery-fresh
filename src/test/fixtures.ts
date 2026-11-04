import { initialState, type AppState } from "@/data/demo";
import { availableDates } from "@/services/delivery";
import type { Address } from "@/types/models";
export const testAddress: Address = {
  id: "address-test",
  cep: "01001000",
  street: "Praça da Sé",
  number: "100",
  noNumber: false,
  complement: "Sala 5",
  neighborhood: "Sé",
  city: "São Paulo",
  uf: "SP",
  reference: "",
  label: "Casa",
  primary: true,
};
export function checkoutState(): AppState {
  const state = structuredClone(initialState);
  const date = availableDates(state.deliverySlots)[0]!;
  return {
    ...state,
    items: { "bowl-vegano": 2 },
    addressBook: [testAddress],
    selectedAddressId: testAddress.id,
    wizard: { ...state.wizard, deliveryDate: date.date, slotId: date.slot.id },
  };
}
