import { CostCalculator } from "../lib/cost-calculator";
import { Offer } from "../domain/offer";
import { Package } from "../domain/package";
import { PackageInput, PricingResult } from "../types";

export class PricingService {
	constructor(
		private costCalculator: CostCalculator,
		private offers: Offer[]
	) {}

	processPackages(baseCost: number, packageInputs: PackageInput[]): PricingResult[] {
		const offerMap = new Map(this.offers.map((o) => [o.code, o]));

		return packageInputs.map((input) => {
			const pkg = new Package(input);
			const offer = offerMap.get(pkg.offerCode);

			const grossCost = this.costCalculator.getGrossCost({
				baseDeliveryCost: baseCost,
				weight: pkg.weight,
				distance: pkg.distance,
			});

			let discount = 0;
			if (offer && offer.isApplicable(pkg)) {
				discount = offer.calculateDiscount(grossCost);
			}

			const totalCost = grossCost - discount;
			return pkg.toResult(discount, totalCost);
		});
	}
}
