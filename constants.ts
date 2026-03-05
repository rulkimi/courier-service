import { IOffer } from "./types";

export const OFFERS: IOffer[] = [
  { code: "OFR001", discount: 10, conditions: { distance: [0, 199], weight: [70, 200] }},
  { code: "OFR002", discount: 7, conditions: { distance: [50, 150], weight: [100, 250] }},
  { code: "OFR003", discount: 5, conditions: { distance: [50, 250], weight: [10, 150] }}
  // expandable
];