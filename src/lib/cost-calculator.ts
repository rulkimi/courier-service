export class CostCalculator {
	getGrossCost(params: { baseDeliveryCost: number; weight: number; distance: number }): number {
		const { baseDeliveryCost, weight, distance } = params;
		const result = baseDeliveryCost + weight * 10 + distance * 5;
		// Handle negative zero: if result is -0, return +0
		if (Object.is(result, -0)) return 0;
		return result;
	}
}
