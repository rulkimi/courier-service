export interface IOffer {
  code: string;
  discount: number;
  conditions: Conditions;
}

export interface Conditions {
  distance: [number, number];
  weight: [number, number];
};