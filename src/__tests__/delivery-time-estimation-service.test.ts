import { PricingService } from "../services/pricing-service";
import { DeliveryTimeEstimationService } from "../services/delivery-time-estimation-service";
import { CostCalculator } from "../lib/cost-calculator";
import { OfferFactory } from "../lib/offer-factory";
import { OFFERS } from "../constants/offers";
import { PackageInput } from "../types";

describe("DeliveryTimeEstimationService", () => {
	let timeEstimationService: DeliveryTimeEstimationService;

	beforeEach(() => {
		const offers = OfferFactory.createMany(OFFERS);
		const costCalculator = new CostCalculator();
		const pricingService = new PricingService(costCalculator, offers);
		timeEstimationService = new DeliveryTimeEstimationService(pricingService);
	});

	test("should return only cost results if no vehicles configuration is provided", () => {
		const baseCost = 100;
		const packages: PackageInput[] = [
			{ id: "PKG1", weight: 50, distance: 30, offerCode: "OFR001" },
		];

		const results = timeEstimationService.processPackages(baseCost, packages);

		expect(results[0]).not.toHaveProperty("estimatedDeliveryTime");
		expect(results[0].totalCost).toBeDefined();
		expect(results[0].discount).toBeDefined();
	});

	test("should estimate delivery time correctly based on sample input", () => {
		const baseCost = 100;
		const packages: PackageInput[] = [
			{ id: "PKG1", weight: 50, distance: 30, offerCode: "OFR001" },
			{ id: "PKG2", weight: 75, distance: 125, offerCode: "OFR008" },
			{ id: "PKG3", weight: 175, distance: 100, offerCode: "OFR003" },
			{ id: "PKG4", weight: 110, distance: 60, offerCode: "OFR002" },
			{ id: "PKG5", weight: 155, distance: 95, offerCode: "NA" },
		];
		const config = { noOfVehicles: 2, maxSpeed: 70, maxCarriageWeight: 200 };

		const results = timeEstimationService.processPackages(baseCost, packages, config);

		// Helper to find result for package by ID
		const getResult = (id: string) => results.find((r) => r.packageId === id);

		const expectedTimes: Record<string, number> = {
			PKG1: 3.98,
			PKG2: 1.78,
			PKG3: 1.42,
			PKG4: 0.85,
			PKG5: 4.19,
		};

		results.forEach((r) => {
			expect(r.estimatedDeliveryTime).toBeCloseTo(expectedTimes[r.packageId], 2);
		});
	});

	test("should handle single package exceeding maxCarriageWeight gracefully", () => {
		const baseCost = 100;
		const packages: PackageInput[] = [
			{ id: "PKG_HEAVY", weight: 250, distance: 30, offerCode: "OFR001" },
			{ id: "PKG_LIGHT", weight: 50, distance: 30, offerCode: "OFR001" },
		];
		const config = { noOfVehicles: 1, maxSpeed: 70, maxCarriageWeight: 200 };

		const results = timeEstimationService.processPackages(baseCost, packages, config);
		expect(results.length).toBe(2);

		// It should still assign PKG_HEAVY to avoid infinite loop
		// Shipment 1: PKG_HEAVY
		// Shipment 2: PKG_LIGHT
		const heavyResult = results.find(r => r.packageId === "PKG_HEAVY");
		const lightResult = results.find(r => r.packageId === "PKG_LIGHT");

		expect(heavyResult?.estimatedDeliveryTime).toBeDefined();
		expect(lightResult?.estimatedDeliveryTime).toBeDefined();
	});

	test("should prefer shipment that can be delivered first if weights are identical", () => {
		const baseCost = 100;
		const packages: PackageInput[] = [
			{ id: "P1", weight: 50, distance: 100, offerCode: "" },
			{ id: "P2", weight: 50, distance: 50, offerCode: "" },
		];
		// Both have same weight (50) and number of items (1) - but we force maxWeight 50 so only 1 can be picked
		const config = { noOfVehicles: 1, maxSpeed: 70, maxCarriageWeight: 50 };

		const results = timeEstimationService.processPackages(baseCost, packages, config);

		const resultP1 = results.find((r) => r.packageId === "P1");
		const resultP2 = results.find((r) => r.packageId === "P2");

		// P2 should be selected first because its max distance (50) is < P1's max distance (100)
		// Delivery P2: time = 50 / 70
		// Vehicle returns: (50/70) * 2
		// Delivery P1: (50/70)*2 + 100/70
		expect(resultP2?.estimatedDeliveryTime).toBeLessThan(resultP1?.estimatedDeliveryTime as number);
	});

	test("should handle weights and distances being identical (stable order)", () => {
		const baseCost = 100;
		const packages: PackageInput[] = [
			{ id: "P1", weight: 50, distance: 50, offerCode: "" },
			{ id: "P2", weight: 50, distance: 50, offerCode: "" },
			{ id: "P3", weight: 50, distance: 50, offerCode: "" },
		];
		const config = { noOfVehicles: 1, maxSpeed: 100, maxCarriageWeight: 50 };

		const results = timeEstimationService.processPackages(baseCost, packages, config);
		expect(results.length).toBe(3);

		const resultP1 = results.find(r => r.packageId === "P1");
		const resultP2 = results.find(r => r.packageId === "P2");
		const resultP3 = results.find(r => r.packageId === "P3");

		// P1, P2, P3 are delivered one after the other.
		// T1: 50/100 = 0.5. T2: 0.5*2 + 0.5 = 1.5. T3: 1.5 + 0.5 + 0.5 = 2.5
		expect(resultP1?.estimatedDeliveryTime).toBeCloseTo(0.5, 2);
		expect(resultP2?.estimatedDeliveryTime).toBeCloseTo(1.5, 2);
		expect(resultP3?.estimatedDeliveryTime).toBeCloseTo(2.5, 2);
	});

	test("should handle zero distance gracefully (instant delivery)", () => {
		const baseCost = 100;
		const packages: PackageInput[] = [
			{ id: "INSTANT", weight: 10, distance: 0, offerCode: "" },
		];
		const config = { noOfVehicles: 1, maxSpeed: 50, maxCarriageWeight: 100 };

		const results = timeEstimationService.processPackages(baseCost, packages, config);
		
		expect(results[0].estimatedDeliveryTime).toBeCloseTo(0, 2);
	});

	test("should handle extremely large array of small packages with multiple vehicle trips", () => {
		const baseCost = 100;
		const packages: PackageInput[] = Array.from({ length: 10 }).map((_, i) => ({
			id: `PKG${i}`,
			weight: 10,
			distance: 10,
			offerCode: ""
		}));
		// Can only carry 2 packages per trip. Total 5 trips. Max speed 10, distance 10 => 1 hr trip, 2 hr roundtrip
		// Only 2 vehicles. 
		// V1: trip 1 (returns T2), trip 3 (returns T6), trip 5
		// V2: trip 2 (returns T2), trip 4 (returns T6)
		const config = { noOfVehicles: 2, maxSpeed: 10, maxCarriageWeight: 20 };

		const results = timeEstimationService.processPackages(baseCost, packages, config);
		expect(results).toHaveLength(10);
		
		const times = results.map(r => r.estimatedDeliveryTime || 0).sort((a,b) => a-b);
		// With parallel dispatches at T0:
		// Shipment 1: T1 delivered (returns T2) -> V1
		// Shipment 2: T1 delivered (returns T2) -> V2
		// Shipment 3: T3 delivered (returns T4) -> V1
		// Shipment 4: T3 delivered (returns T4) -> V2
		// Shipment 5: T5 delivered (returns T6) -> V1 or V2
		
		expect(times.filter(t => t === 1.0)).toHaveLength(4); // 2 shipments, 4 pkgs total
		expect(times.filter(t => t === 3.0)).toHaveLength(4);
		expect(times.filter(t => t === 5.0)).toHaveLength(2);
	});
});
