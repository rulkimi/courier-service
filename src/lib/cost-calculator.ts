export class CostCalculator {
	getGrossCost(params: { baseDeliveryCost: number; weight: number; distance: number }): number {
		const { baseDeliveryCost, weight, distance } = params;
		return baseDeliveryCost + weight * 10 + distance * 5;
	}
}
