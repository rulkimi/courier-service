import { DeliveryResult } from "../types";

export function printInstructions() {
	console.log("Delivery System Estimator (Cost & Time)");
	console.log("=======================================");
	console.log(
		"Please enter the base delivery cost and number of packages (e.g.: 100 3)\n" +
		"Then enter each package on a new line in the format:\n" +
		"<package_id> <package_weight_in_kg> <distance_in_km> <offer_code?>\n" +
		"\nOptional: To also estimate delivery time, add a line at the end:\n" +
		"<no_of_vehicles> <max_speed> <max_carriage_weight>\n" +
		"\nExample:\n" +
		"100 3\n" +
		"PKG1 5 5 OFR001\n" +
		"PKG2 15 5 OFR002\n" +
		"PKG3 10 100 OFR003\n" +
		"2 70 200\n" +
		"\nTo end your input, press Ctrl+D (Linux/Mac) or Ctrl+Z then Enter (Windows).\n"
	);
}

const DEFAULT_CURRENCY = 'RM';

function formatPrice(amount: number, currency: string = DEFAULT_CURRENCY): string {
	if (!Number.isFinite(amount)) return String(amount);
	return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function displayResultsTable(results: DeliveryResult[]) {
	console.log('\n--- Delivery Results ---');
	const hasTime = results.some(r => r.estimatedDeliveryTime !== undefined);
	
	if (hasTime) {
		console.log('Package ID | Discount         | Total Cost       | Estimated Time (hrs)');
		console.log('-----------|------------------|------------------|---------------------');
	} else {
		console.log('Package ID | Discount         | Total Cost       ');
		console.log('-----------|------------------|------------------');
	}

	for (const res of results) {
		const discountDisplay = formatPrice(res.discount);
		const totalCostDisplay = formatPrice(res.totalCost);
		
		let row = `${res.packageId.padEnd(10)} | ${discountDisplay.padStart(16)} | ${totalCostDisplay.padStart(16)}`;
		
		if (hasTime && res.estimatedDeliveryTime !== undefined) {
			row += ` | ${res.estimatedDeliveryTime.toFixed(2).padStart(20)}`;
		}
		console.log(row);
	}
}
