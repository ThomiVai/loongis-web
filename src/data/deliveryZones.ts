export type DeliveryZone = {
  id: string;
  name: string;
  price: number;
  estimatedTime: string;
};

export const deliveryZones: DeliveryZone[] = [
  {
    id: "hurlingham",
    name: "Hurlingham",
    price: 1500,
    estimatedTime: "30 a 45 minutos",
  },
  {
    id: "villa-tesei",
    name: "Villa Tesei",
    price: 1800,
    estimatedTime: "35 a 50 minutos",
  },
  {
    id: "william-morris",
    name: "William Morris",
    price: 2000,
    estimatedTime: "40 a 55 minutos",
  },
  {
    id: "el-palomar",
    name: "El Palomar",
    price: 2500,
    estimatedTime: "45 a 60 minutos",
  },
  {
    id: "haedo",
    name: "Haedo",
    price: 2800,
    estimatedTime: "50 a 65 minutos",
  },
];