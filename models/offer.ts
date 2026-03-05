import { Conditions, IOffer } from "../types";

export default class Offer {
  public code: string;
  public discount: number;
  public conditions: Conditions;

  constructor(offer: IOffer) {
    this.code = offer.code;
    this.discount = offer.discount;
    this.conditions = offer.conditions;
  }

  isValid(distance: number, weight: number): boolean {
    const [minDist, maxDist] = this.conditions.distance;
    const [minWeight, maxWeight] = this.conditions.weight;
    return (
      distance >= minDist &&
      distance <= maxDist &&
      weight >= minWeight &&
      weight <= maxWeight
    );
  }
}
