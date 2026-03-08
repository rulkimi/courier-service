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

	isApplicable(pkg: Package | null | undefined): boolean {
		if (!pkg || !pkg.offerCode || pkg.offerCode !== this.code) return false;
		if (this.conditions.length === 0) return true;
		return this.conditions.every((c) => c.isSatisfiedBy(pkg));
	}

	calculateDiscount(baseCost: number): number {
		if (
			typeof baseCost !== "number" ||
			!isFinite(baseCost) ||
			baseCost <= 0 ||
			this.discountPercentage === 0 ||
			this.discountPercentage < 0
		) {
			return 0;
		}
		return Math.floor((baseCost * this.discountPercentage) / 100);
	}
}
