import { CostCalculator } from "../lib/cost-calculator";
import { PricingService } from "../services/pricing-service";
import { DeliveryTimeEstimationService } from "../services/delivery-time-estimation-service";
import { InputParser } from "../lib/input-parser";
import { OfferFactory } from "../lib/offer-factory";
import { OFFERS } from "../constants/offers";

describe("Courier Service Integration", () => {
	let costCalculator: CostCalculator;
	let pricingService: PricingService;
	let timeEstimationService: DeliveryTimeEstimationService;

	beforeEach(() => {
		const offers = OfferFactory.createMany(OFFERS);
		costCalculator = new CostCalculator();
		pricingService = new PricingService(costCalculator, offers);
		timeEstimationService = new DeliveryTimeEstimationService(pricingService);
	});

	test("end-to-end processing with sample input and times", () => {
		const configStr = "100 5";
		const pkgStrs = [
			"PKG1 50 30 OFR001",
			"PKG2 75 125 OFR008",
			"PKG3 175 100 OFR003",
			"PKG4 110 60 OFR002",
			"PKG5 155 95 NA"
		];
		const vehiclesStr = "2 70 200";

		// Parase
		const { baseCost } = InputParser.parseDeliveryConfig(configStr);
		const packages = pkgStrs.map(str => InputParser.parsePackage(str));
		const vehiclesConfig = InputParser.parseVehiclesConfig(vehiclesStr);

		// Process
		const results = timeEstimationService.processPackages(baseCost, packages, vehiclesConfig);

		// Validate
		expect(results).toHaveLength(5);

		const expected = [
			{ packageId: "PKG1", discount: 0, totalCost: 750, estimatedDeliveryTime: 3.98 },
			{ packageId: "PKG2", discount: 0, totalCost: 1475, estimatedDeliveryTime: 1.78 },
			{ packageId: "PKG3", discount: 0, totalCost: 2350, estimatedDeliveryTime: 1.42 },
			{ packageId: "PKG4", discount: 105, totalCost: 1395, estimatedDeliveryTime: 0.85 },
			{ packageId: "PKG5", discount: 0, totalCost: 2125, estimatedDeliveryTime: 4.19 },
		];

		expected.forEach(exp => {
			const res = results.find(r => r.packageId === exp.packageId);
			expect(res).toBeDefined();
			expect(res?.discount).toBe(exp.discount);
			expect(res?.totalCost).toBe(exp.totalCost);
			expect(res?.estimatedDeliveryTime).toBeCloseTo(exp.estimatedDeliveryTime, 2);
		});
	});

	test("end-to-end processing without vehicles config", () => {
		const configStr = "100 3";
		const pkgStrs = [
			"PKG1 5 5 OFR001",
			"PKG2 15 5 OFR002",
			"PKG3 10 100 OFR003"
		];

		// Parse
		const { baseCost } = InputParser.parseDeliveryConfig(configStr);
		const packages = pkgStrs.map(str => InputParser.parsePackage(str));

		// Process
		const results = timeEstimationService.processPackages(baseCost, packages);

		// Validate
		expect(results).toHaveLength(3);

		const expected = [
			{ packageId: "PKG1", discount: 0, totalCost: 175 },
			{ packageId: "PKG2", discount: 0, totalCost: 275 },
			{ packageId: "PKG3", discount: 35, totalCost: 665 },
		];

		expected.forEach(exp => {
			const res = results.find(r => r.packageId === exp.packageId);
			expect(res).toBeDefined();
			expect(res?.discount).toBe(exp.discount);
			expect(res?.totalCost).toBe(exp.totalCost);
			expect(res?.estimatedDeliveryTime).toBeUndefined();
		});
	});

	test("end-to-end processing with creative/messy user input formats (tabs, newlines, missing offers)", () => {
		const configStr = "  \n\t 150 \n  3 \t   ";
		const pkgStrs = [
			"   PKG1 \t 10 \t 15 \t OFR001  ",
			"PKG2    10.5     15.2   ", // no code
			" PKG3\t 100\t100\t\t\tOFR003 "
		];
		const vehiclesStr = "  1 \t10 \n 20 \t";

		const { baseCost } = InputParser.parseDeliveryConfig(configStr);
		const packages = pkgStrs.map(str => InputParser.parsePackage(str));
		const vehiclesConfig = InputParser.parseVehiclesConfig(vehiclesStr);

		const results = timeEstimationService.processPackages(baseCost, packages, vehiclesConfig);

		expect(results).toHaveLength(3);
		// Check that results exist and costs/times calculate despite spacing
		expect(results.find(r => r.packageId === "PKG1")?.discount).toBe(0); // weight < 70
		expect(results.find(r => r.packageId === "PKG2")?.discount).toBe(0); // no code
		expect(results.find(r => r.packageId === "PKG3")?.discount).toBe(82); // 5% of (150 + 100*10 + 100*5 = 1650) => 82.5 rounded down
	});

	test("end-to-end processing handling edge cases (zeroes inputs, logically minimal values)", () => {
		const configStr = "0 2";
		const pkgStrs = [
			"ZERO 0 0 OFR001",
			"NEAR_ZERO 0.001 0.001 OFR002" // no discount
		];
		const vehiclesStr = "1 1000 100";

		const { baseCost } = InputParser.parseDeliveryConfig(configStr);
		const packages = pkgStrs.map(str => InputParser.parsePackage(str));
		const vehiclesConfig = InputParser.parseVehiclesConfig(vehiclesStr);

		const results = timeEstimationService.processPackages(baseCost, packages, vehiclesConfig);

		expect(results).toHaveLength(2);
		expect(results.find(r => r.packageId === "ZERO")?.estimatedDeliveryTime).toBeCloseTo(0, 2);
		expect(results.find(r => r.packageId === "NEAR_ZERO")?.estimatedDeliveryTime).toBeCloseTo(0, 2);
	});
});
