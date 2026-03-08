import { Package } from "./package";
import { ICondition } from "./condition";

export class Offer {
	readonly code: string;
	readonly discountPercentage: number;
	private readonly conditions: ICondition[];

	constructor(code: string, discountPercentage: number, conditions: ICondition[]) {
		this.code = code;
		this.discountPercentage = discountPercentage;
		this.conditions = conditions;
	}

	isApplicable(pkg: Package): boolean {
		if (this.conditions.length === 0) return true;
		return this.conditions.every((c) => c.isSatisfiedBy(pkg));
	}

	calculateDiscount(baseCost: number): number {
		return (baseCost * this.discountPercentage) / 100;
	}
}
