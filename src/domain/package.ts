import { PackageInput, PricingResult } from "../types";

export class Package {
	readonly id: string;
	readonly weight: number;
	readonly distance: number;
	readonly offerCode: string;

	constructor(input: PackageInput) {
		this.id = input.id;
		this.weight = input.weight;
		this.distance = input.distance;
		this.offerCode = input.offerCode;
	}

	toResult(discount: number, totalCost: number): PricingResult {
		return {
			packageId: this.id,
			discount,
			totalCost,
		};
	}
}
