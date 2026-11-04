import type { DeliveryZone } from "@/types/models";
export const mockDeliveryZones: DeliveryZone[] = [
  {
    id: "se",
    city: "São Paulo",
    neighborhood: "Sé",
    uf: "SP",
    fee: 7.9,
    estimate: "1 a 2 dias • simulação",
    active: true,
  },
  {
    id: "centro",
    city: "São Paulo",
    neighborhood: "Centro",
    uf: "SP",
    fee: 7.9,
    estimate: "1 a 2 dias • simulação",
    active: true,
  },
  {
    id: "pinheiros",
    city: "São Paulo",
    neighborhood: "Pinheiros",
    uf: "SP",
    fee: 12.9,
    estimate: "2 a 3 dias • simulação",
    active: true,
  },
  {
    id: "vila-mariana",
    city: "São Paulo",
    neighborhood: "Vila Mariana",
    uf: "SP",
    fee: 10.9,
    estimate: "1 a 2 dias • simulação",
    active: true,
  },
];
