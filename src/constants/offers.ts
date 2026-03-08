import { IOffer } from "../types";

export const OFFERS: IOffer[] = [
  {
    code: "OFR001",
    discountPercentage: 10,
    conditions: {
      distance: { min: 0, max: 199 },
      weight: { min: 70, max: 200 },
    },
  },
  {
    code: "OFR002",
    discountPercentage: 7,
    conditions: {
      distance: { min: 50, max: 150 },
      weight: { min: 100, max: 250 },
    },
  },
  {
    code: "OFR003",
    discountPercentage: 5,
    conditions: {
      distance: { min: 50, max: 250 },
      weight: { min: 10, max: 150 },
    },
  },
];
