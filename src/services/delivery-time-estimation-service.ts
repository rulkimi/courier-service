import { PricingService } from "./pricing-service";
import { DeliveryResult, vehiclesConfig, PackageInput } from "../types";

export class DeliveryTimeEstimationService {
	constructor(private pricingService: PricingService) {}

	processPackages(
		baseCost: number,
		packages: PackageInput[],
		config?: vehiclesConfig
	): DeliveryResult[] {
		const costResults = this.pricingService.processPackages(baseCost, packages);
		
		const results: DeliveryResult[] = costResults.map((r) => ({ ...r }));

		if (!config) {
			return results;
		}

		const deliveryTimes = new Map<string, number>();
		let remainingPackages = [...packages];
		const shipments: PackageInput[][] = [];

		while (remainingPackages.length > 0) {
			const bestShipment = this.getBestShipment(remainingPackages, config.maxCarriageWeight);
			if (bestShipment.length === 0) {
				// Prevent infinite loop if a single package exceeds maxCarriageWeight
				bestShipment.push(remainingPackages[0]);
			}
			shipments.push(bestShipment);

			const selectedIds = new Set(bestShipment.map((p) => p.id));
			remainingPackages = remainingPackages.filter((p) => !selectedIds.has(p.id));
		}

		const vehicleAvailableTimes = new Array(config.noOfVehicles).fill(0);

		// Helper to safely truncate to 2 decimals down to avoid float precision issues like 4.1899999
		const truncateTime = (time: number) => Math.floor(time * 100 + 0.00001) / 100;

		for (const shipment of shipments) {
			let earliestTime = vehicleAvailableTimes[0];
			let vehicleIndex = 0;
			for (let i = 1; i < vehicleAvailableTimes.length; i++) {
				if (vehicleAvailableTimes[i] < earliestTime) {
					earliestTime = vehicleAvailableTimes[i];
					vehicleIndex = i;
				}
			}

			const dispatchTime = earliestTime;
			let maxPackageDistance = 0;

			for (const pkg of shipment) {
				const timeToDeliver = truncateTime(pkg.distance / config.maxSpeed);
				const deliveryTime = truncateTime(dispatchTime + timeToDeliver);
				
				deliveryTimes.set(pkg.id, deliveryTime);

				if (pkg.distance > maxPackageDistance) {
					maxPackageDistance = pkg.distance;
				}
			}

			// Vehicle returns after delivering to the furthest location
			const maxTimeToDeliver = truncateTime(maxPackageDistance / config.maxSpeed);
			const roundTripTime = 2 * maxTimeToDeliver;
			vehicleAvailableTimes[vehicleIndex] = truncateTime(dispatchTime + roundTripTime);
		}

		for (const res of results) {
			res.estimatedDeliveryTime = deliveryTimes.get(res.packageId);
		}

		return results;
	}

	private getBestShipment(packages: PackageInput[], maxWeight: number): PackageInput[] {
		let bestSubset: PackageInput[] = [];

		const findCombinations = (
			start: number,
			currentSubset: PackageInput[],
			currentWeight: number
		) => {
			if (currentWeight > maxWeight) return;

			const currentTotalWeight = currentWeight;
			const bestTotalWeight = this.getTotalWeight(bestSubset);

			if (currentSubset.length > bestSubset.length) {
				bestSubset = [...currentSubset];
			} else if (currentSubset.length === bestSubset.length) {
				if (currentTotalWeight > bestTotalWeight) {
					bestSubset = [...currentSubset];
				} else if (currentTotalWeight === bestTotalWeight && currentSubset.length > 0) {
					// "If the weights are also the same, preference should be given to the shipment which can be delivered first."
					const currentMaxDistance = Math.max(...currentSubset.map((p) => p.distance));
					const bestMaxDistance = Math.max(...bestSubset.map((p) => p.distance));

					if (currentMaxDistance < bestMaxDistance) {
						bestSubset = [...currentSubset];
					}
				}
			}

			for (let i = start; i < packages.length; i++) {
				findCombinations(
					i + 1,
					[...currentSubset, packages[i]],
					currentWeight + packages[i].weight
				);
			}
		};

		findCombinations(0, [], 0);
		return bestSubset;
	}

	private getTotalWeight(packages: PackageInput[]): number {
		return packages.reduce((sum, pkg) => sum + pkg.weight, 0);
	}
}