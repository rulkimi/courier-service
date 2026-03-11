import { PricingService } from "../services/pricing-service";
import { CostCalculator } from "../lib/cost-calculator";
import { OfferFactory } from "../lib/offer-factory";
import { OFFERS } from "../constants/offers";
import { PackageInput } from "../types";

describe("PricingService", () => {
	let pricingService: PricingService;
	let costCalculator: CostCalculator;

	beforeEach(() => {
		const offers = OfferFactory.createMany(OFFERS);
		costCalculator = new CostCalculator();
		pricingService = new PricingService(costCalculator, offers);
	});

	test("should process packages and apply matching discounts correctly", () => {
		const baseCost = 100;
		const packages: PackageInput[] = [
			{ id: "PKG1", weight: 5, distance: 5, offerCode: "OFR001" }, // OFR001 requires weight 70-200, dist<200 (not matched)
			{ id: "PKG2", weight: 15, distance: 5, offerCode: "OFR002" }, // OFR002 requires weight 100-250, dist 50-150 (not matched)
			{ id: "PKG3", weight: 10, distance: 100, offerCode: "OFR003" }, // OFR003 requires weight 10-150, dist 50-250 (matched)
			{ id: "PKG4", weight: 150, distance: 50, offerCode: "OFR002" }, // OFR002 matched
		];

		const results = pricingService.processPackages(baseCost, packages);

		expect(results.length).toBe(4);

		// PKG1: Gross = 100 + (5 * 10) + (5 * 5) = 100 + 50 + 25 = 175
		// Distance < 200, but weight 5 is < 70 => OFF001 not applied => totalCost = 175
		expect(results[0]).toEqual({
			packageId: "PKG1",
			discount: 0,
			totalCost: 175
		});

		// PKG2: Gross = 100 + (15 * 10) + (5 * 5) = 100 + 150 + 25 = 275
		// Weight 15 is < 100 => OFF002 not applied => totalCost = 275
		expect(results[1]).toEqual({
			packageId: "PKG2",
			discount: 0,
			totalCost: 275
		});

		// PKG3: Gross = 100 + (10 * 10) + (100 * 5) = 100 + 100 + 500 = 700
		// Weight 10 (>=10 <=150), Distance 100 (>=50 <=250) => OFR003 matched (5% discount)
		// Discount = 700 * 0.05 = 35 => totalCost = 665
		expect(results[2]).toEqual({
			packageId: "PKG3",
			discount: 35,
			totalCost: 665
		});

		// PKG4: Gross = 100 + (150 * 10) + (50 * 5) = 100 + 1500 + 250 = 1850
		// Weight 150 (>=100 <=250), Distance 50 (>=50 <=150) => OFR002 matched (7% discount)
		// Discount = 1850 * 0.07 = 129 => totalCost = 1850 - 129 = 1721 (rounding done by Math.floor in calc)
		expect(results[3]).toEqual({
			packageId: "PKG4",
			discount: 129,
			totalCost: 1721
		});
	});

	test("should handle package with unknown offer code gracefully", () => {
		const baseCost = 100;
		const packages: PackageInput[] = [
			{ id: "PKG1", weight: 50, distance: 50, offerCode: "UNKNOWN" },
		];

		const results = pricingService.processPackages(baseCost, packages);

		// Gross = 100 + (50 * 10) + (50 * 5) = 850
		expect(results[0]).toEqual({
			packageId: "PKG1",
			discount: 0,
			totalCost: 850
		});
	});

	test("should handle empty package list", () => {
		const baseCost = 100;
		const results = pricingService.processPackages(baseCost, []);
		expect(results).toEqual([]);
	});
});
