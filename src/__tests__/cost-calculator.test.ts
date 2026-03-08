import { CostCalculator } from "../lib/cost-calculator";

describe("CostCalculator", () => {
	const calculator = new CostCalculator();

	test("should calculate gross cost correctly", () => {
		expect(
			calculator.getGrossCost({
				baseDeliveryCost: 100,
				weight: 10,
				distance: 10,
			})
		).toBe(250);
	});

	test("should handle zero values", () => {
		expect(
			calculator.getGrossCost({
				baseDeliveryCost: 0,
				weight: 0,
				distance: 0,
			})
		).toBe(0);
	});

	test("should handle zero weight", () => {
		expect(
			calculator.getGrossCost({
				baseDeliveryCost: 100,
				weight: 0,
				distance: 10,
			})
		).toBe(150);
	});

	test("should handle zero distance", () => {
		expect(
			calculator.getGrossCost({
				baseDeliveryCost: 100,
				weight: 10,
				distance: 0,
			})
		).toBe(200);
	});

	test("should handle large numbers", () => {
		const base = 1_000_000;
		const weight = 10_000;
		const distance = 20_000;
		expect(
			calculator.getGrossCost({
				baseDeliveryCost: base,
				weight,
				distance,
			})
		).toBe(1_200_000);
	});

	test("should handle negative values", () => {
		expect(
			calculator.getGrossCost({
				baseDeliveryCost: -100,
				weight: -10,
				distance: -10,
			})
		).toBe(-250);
	});

	test("should handle floating point values", () => {
		expect(
			calculator.getGrossCost({
				baseDeliveryCost: 100.5,
				weight: 2.5,
				distance: 3.5,
			})
		).toBe(143);
	});

	test("should handle very large floats (near JS max safe integer)", () => {
		const base = Number.MAX_SAFE_INTEGER - 1_000_000;
		expect(
			calculator.getGrossCost({
				baseDeliveryCost: base,
				weight: 1000,
				distance: 1000,
			})
		).toBe(base + 1000 * 10 + 1000 * 5);
	});

	test("should handle very small positive numbers", () => {
		const base = 0.00001;
		const weight = 0.00001;
		const distance = 0.00001;
		const expected = base + weight * 10 + distance * 5;
		expect(
			calculator.getGrossCost({
				baseDeliveryCost: base,
				weight,
				distance
			})
		).toBeCloseTo(expected, 10);
	});

	test("should handle negative zeroes", () => {
		expect(
			calculator.getGrossCost({
				baseDeliveryCost: -0,
				weight: -0,
				distance: -0,
			})
		).toBe(0);
	});

	test("should handle NaN values", () => {
		expect(
			isNaN(
				calculator.getGrossCost({
					baseDeliveryCost: NaN,
					weight: 10,
					distance: 10,
				})
			)
		).toBe(true);

		expect(
			isNaN(
				calculator.getGrossCost({
					baseDeliveryCost: 100,
					weight: NaN,
					distance: 10,
				})
			)
		).toBe(true);

		expect(
			isNaN(
				calculator.getGrossCost({
					baseDeliveryCost: 100,
					weight: 10,
					distance: NaN,
				})
			)
		).toBe(true);
	});

	test("should handle Infinity values", () => {
		expect(
			calculator.getGrossCost({
				baseDeliveryCost: Infinity,
				weight: 10,
				distance: 10,
			})
		).toBe(Infinity);

		expect(
			calculator.getGrossCost({
				baseDeliveryCost: 100,
				weight: Infinity,
				distance: 10,
			})
		).toBe(Infinity);

		expect(
			calculator.getGrossCost({
				baseDeliveryCost: 100,
				weight: 10,
				distance: Infinity,
			})
		).toBe(Infinity);

		expect(
			calculator.getGrossCost({
				baseDeliveryCost: -Infinity,
				weight: 10,
				distance: 10,
			})
		).toBe(-Infinity);

		expect(
			calculator.getGrossCost({
				baseDeliveryCost: 100,
				weight: -Infinity,
				distance: 10,
			})
		).toBe(-Infinity);

		expect(
			calculator.getGrossCost({
				baseDeliveryCost: 100,
				weight: 10,
				distance: -Infinity,
			})
		).toBe(-Infinity);
	});

	test("should handle mixed signs", () => {
		expect(calculator.getGrossCost({
			baseDeliveryCost: 100,
			weight: 10,
			distance: -10,
		})).toBe(100 + 10*10 -10*5); // 100 + 100 -50 = 150

		expect(calculator.getGrossCost({
			baseDeliveryCost: -100,
			weight: 10,
			distance: 10
		})).toBe(-100 + 100 + 50); // 50

		expect(calculator.getGrossCost({
			baseDeliveryCost: 100,
			weight: -10,
			distance: 10
		})).toBe(100 -100 +50); // 50
	});

	test("should work for minimal positive values", () => {
		expect(
			calculator.getGrossCost({
				baseDeliveryCost: Number.EPSILON,
				weight: Number.EPSILON,
				distance: Number.EPSILON
			})
		).toBeCloseTo(Number.EPSILON + Number.EPSILON*10 + Number.EPSILON*5, 12);
	});

	test("should handle values that sum to zero", () => {
		expect(
			calculator.getGrossCost({
				baseDeliveryCost: 0,
				weight: 1,
				distance: -2
			})
		).toBe(0 + 1*10 + -2*5); // 10 + -10 = 0
	});
});
