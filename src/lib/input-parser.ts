import { PackageInput } from "../types";

export class InputParser {
	static parseConfig(line: string): { baseCost: number; packageCount: number } {
		const parts = line.trim().split(/\s+/);
		if (parts.length < 2) {
			throw new Error("Invalid config format. Expected: <base_delivery_cost> <no_of_packages>");
		}

		const baseCost = parseFloat(parts[0]);
		const packageCount = parseInt(parts[1], 10);

		if (isNaN(baseCost) || isNaN(packageCount)) {
			throw new Error("Invalid values for config. Delivery cost and no. of packages should be typeof number.");
		}

		return { baseCost, packageCount };
	}

	static parsePackage(line: string): PackageInput {
		const parts = line.trim().split(/\s+/);
		if (parts.length < 3) {
			throw new Error(`Invalid package format: ${line}. Expected: <pkg_id> <pkg_weight_in_kg> <distance_in_km> <offer_code>`);
		}

		const id = parts[0];
		const weight = parseFloat(parts[1]);
		const distance = parseFloat(parts[2]);
		const offerCode = parts[3] || "";

		if (isNaN(weight) || isNaN(distance)) {
			throw new Error(`Invalid values for package ${id}; weight and distance should be typeof number.`);
		}

		return { id, weight, distance, offerCode };
	}
}
