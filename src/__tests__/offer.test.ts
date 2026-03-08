import { OfferFactory } from "../lib/offer-factory";
import { Package } from "../domain/package";

describe("Offer (array usage)", () => {
	const sampleOffers = [
		OfferFactory.create({
			code: "OFR001",
			discountPercentage: 10,
			conditions: {
				distance: { min: 0, max: 200 },
				weight: { min: 70, max: 200 },
			},
		}),
		OfferFactory.create({
			code: "OFR002",
			discountPercentage: 7,
			conditions: {
				distance: { min: 50, max: 150 },
				weight: { min: 100, max: 250 },
			},
		}),
	];

	function findApplicableOffer(pkg: Package | null | undefined) {
		return sampleOffers.find((offer) => offer.isApplicable(pkg));
	}

	test("should be applicable when within range", () => {
		const pkg = new Package({
			id: "P1",
			weight: 80,
			distance: 100,
			offerCode: "OFR001",
		});
		expect(findApplicableOffer(pkg)).toBe(sampleOffers[0]);
	});

	test("should be applicable when values are at min inclusive", () => {
		const pkg = new Package({
			id: "P2",
			weight: 70,
			distance: 0,
			offerCode: "OFR001",
		});
		expect(findApplicableOffer(pkg)).toBe(sampleOffers[0]);
	});

	test("should be applicable when values are at max inclusive", () => {
		const pkg = new Package({
			id: "P3",
			weight: 200,
			distance: 200,
			offerCode: "OFR001",
		});
		expect(findApplicableOffer(pkg)).toBe(sampleOffers[0]);
	});

	test("should be applicable for second offer at edge values", () => {
		const pkg = new Package({
			id: "Q1",
			weight: 100,
			distance: 50,
			offerCode: "OFR002",
		});
		expect(findApplicableOffer(pkg)).toBe(sampleOffers[1]);
		const pkg2 = new Package({
			id: "Q2",
			weight: 250,
			distance: 150,
			offerCode: "OFR002",
		});
		expect(findApplicableOffer(pkg2)).toBe(sampleOffers[1]);
	});

	test("should not be applicable when weight is just below min", () => {
		const pkg = new Package({
			id: "P4",
			weight: 69.99,
			distance: 100,
			offerCode: "OFR001",
		});
		expect(findApplicableOffer(pkg)).toBeUndefined();
	});

	test("should not be applicable when weight is just above max", () => {
		const pkg = new Package({
			id: "P5",
			weight: 200.01,
			distance: 100,
			offerCode: "OFR001",
		});
		expect(findApplicableOffer(pkg)).toBeUndefined();
	});

	test("should not be applicable with minimal weight just under second range", () => {
		const pkg = new Package({
			id: "Q3",
			weight: 99.99,
			distance: 50,
			offerCode: "OFR002",
		});
		expect(findApplicableOffer(pkg)).toBeUndefined();
	});

	test("should not be applicable with maximum weight just over second range", () => {
		const pkg = new Package({
			id: "Q4",
			weight: 250.01,
			distance: 100,
			offerCode: "OFR002",
		});
		expect(findApplicableOffer(pkg)).toBeUndefined();
	});

	test("should not be applicable when distance is just below min", () => {
		const pkg = new Package({
			id: "P6",
			weight: 80,
			distance: -0.01,
			offerCode: "OFR001",
		});
		expect(findApplicableOffer(pkg)).toBeUndefined();
	});

	test("should not be applicable when distance is just above max", () => {
		const pkg = new Package({
			id: "P7",
			weight: 80,
			distance: 200.01,
			offerCode: "OFR001",
		});
		expect(findApplicableOffer(pkg)).toBeUndefined();
	});

	test("should not be applicable for distance just below min in second offer", () => {
		const pkg = new Package({
			id: "Q5",
			weight: 120,
			distance: 49.99,
			offerCode: "OFR002",
		});
		expect(findApplicableOffer(pkg)).toBeUndefined();
	});

	test("should not be applicable for distance just above max in second offer", () => {
		const pkg = new Package({
			id: "Q6",
			weight: 120,
			distance: 150.01,
			offerCode: "OFR002",
		});
		expect(findApplicableOffer(pkg)).toBeUndefined();
	});

	test("should not be applicable with wrong offer code", () => {
		const pkg = new Package({
			id: "P8",
			weight: 100,
			distance: 100,
			offerCode: "OFR999",
		});
		expect(findApplicableOffer(pkg)).toBeUndefined();
	});

	test("should not be applicable with empty offer code string", () => {
		const pkg = new Package({
			id: "R0",
			weight: 100,
			distance: 100,
			offerCode: "",
		});
		expect(findApplicableOffer(pkg)).toBeUndefined();
	});

	test("should not be applicable when offerCode is missing", () => {
		// @ts-expect-error
		const pkg = new Package({
			id: "P9",
			weight: 100,
			distance: 100,
		});
		expect(findApplicableOffer(pkg)).toBeUndefined();
	});

	test("should not be applicable when offerCode is null or undefined (edge case)", () => {
		// Type assertion to circumvent TS error for testing edge case handling
		const pkg1 = new Package({
			id: "P10",
			weight: 100,
			distance: 100,
			offerCode: null as unknown as string,
		});
		expect(findApplicableOffer(pkg1)).toBeUndefined();

		const pkg2 = new Package({
			id: "P11",
			weight: 100,
			distance: 100,
			offerCode: undefined as unknown as string,
		});
		expect(findApplicableOffer(pkg2)).toBeUndefined();
	});

	test("should not be applicable if package is null or undefined", () => {
		// @ts-ignore
		expect(findApplicableOffer(null)).toBeUndefined();
		// @ts-ignore
		expect(findApplicableOffer(undefined)).toBeUndefined();
	});

	test("should handle package with extremely large numbers", () => {
		const pkg = new Package({
			id: "LARGE",
			weight: 1e12,
			distance: 1e12,
			offerCode: "OFR001"
		});
		expect(findApplicableOffer(pkg)).toBeUndefined();
	});

	test("should handle package with negative weight and distance (invalid)", () => {
		const pkg = new Package({
			id: "NEG",
			weight: -10,
			distance: -20,
			offerCode: "OFR001"
		});
		expect(findApplicableOffer(pkg)).toBeUndefined();
	});

	test("should be applicable to first offer and not to second when overlapping but wrong code", () => {
		const pkg = new Package({
			id: "OVR",
			weight: 100,
			distance: 100,
			offerCode: "OFR001"
		});
		expect(findApplicableOffer(pkg)).toBe(sampleOffers[0]);
	});

	test("should not find any offer if none matches", () => {
		const pkg = new Package({
			id: "NOMATCH",
			weight: 10,
			distance: 10,
			offerCode: "OFRXXX"
		});
		expect(findApplicableOffer(pkg)).toBeUndefined();
	});

	test("should not find any if offers array is empty", () => {
		const pkg = new Package({
			id: "P100",
			weight: 80,
			distance: 100,
			offerCode: "OFR001"
		});
		const findInEmpty = (_pkg: Package) => ([] as typeof sampleOffers).find(o => o.isApplicable(_pkg));
		expect(findInEmpty(pkg)).toBeUndefined();
	});

	// --- Discount Calculation Edge Cases ---
	test("should calculate discount correctly on first offer", () => {
		expect(sampleOffers[0].calculateDiscount(1000)).toBe(100);
	});

	test("should calculate discount as integer with rounding down", () => {
		expect(sampleOffers[0].calculateDiscount(999)).toBe(99);
		expect(sampleOffers[1].calculateDiscount(999)).toBe(69);
	});

	test("should return 0 discount for zero cost", () => {
		expect(sampleOffers[0].calculateDiscount(0)).toBe(0);
		expect(sampleOffers[1].calculateDiscount(0)).toBe(0);
	});

	test("should return 0 discount for negative cost (edge)", () => {
		expect(sampleOffers[0].calculateDiscount(-100)).toBe(0);
		expect(sampleOffers[1].calculateDiscount(-100)).toBe(0);
	});

	test("should return 0 discount if discountPercentage is 0", () => {
		const noDiscountOffer = OfferFactory.create({
			code: "OFR004",
			discountPercentage: 0,
			conditions: {
				distance: { min: 0, max: 100 },
				weight: { min: 1, max: 10 },
			},
		});
		expect(noDiscountOffer.calculateDiscount(100)).toBe(0);
		expect(noDiscountOffer.calculateDiscount(999)).toBe(0);
	});

	test("should calculate discount for very large cost", () => {
		expect(sampleOffers[0].calculateDiscount(1e6)).toBe(100000);
	});

	test("should return 0 discount if baseCost is undefined or null (edge)", () => {
		expect(sampleOffers[0].calculateDiscount(Number(undefined))).toBe(0);
		expect(sampleOffers[0].calculateDiscount(Number(null))).toBe(0);
	});

	test("should return 0 discount if baseCost is NaN (edge)", () => {
		expect(sampleOffers[0].calculateDiscount(NaN)).toBe(0);
	});

	test("should return 0 discount if discountPercentage is negative (edge logic case)", () => {
		const negativeDiscountOffer = OfferFactory.create({
			code: "OFR005",
			discountPercentage: -10,
			conditions: {
				distance: { min: 0, max: 100 },
				weight: { min: 1, max: 10 },
			},
		});
		expect(negativeDiscountOffer.calculateDiscount(100)).toBe(0);
	});

	test("should only match correct offer code even if range matches another offer", () => {
		const pkg = new Package({
			id: "ZCODE",
			weight: 150,
			distance: 120,
			offerCode: "OFR999",
		});
		expect(findApplicableOffer(pkg)).toBeUndefined();
	});

	test("should apply discount calculation rounding down properly at .99", () => {
		expect(sampleOffers[0].calculateDiscount(999.99)).toBe(99);
	});
	test("should apply discount calculation for very small baseCost (below percentage effect)", () => {
		expect(sampleOffers[0].calculateDiscount(0.5)).toBe(0);
		expect(sampleOffers[1].calculateDiscount(0.5)).toBe(0);
	});
});
