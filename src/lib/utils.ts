export function printInstructions() {
	console.log("Delivery Cost Calculator");
	console.log("========================");
	console.log(
		"Please enter the base delivery cost and number of packages (e.g.: 100 3)\n" +
		"Then enter each package on a new line in the format:\n" +
		"<package_id> <package_weight_in_kg> <distance_in_km> <offer_code?>\n" +
		"Example:\n" +
		"PKG1 5 5 OFR001\n" +
		"PKG2 15 5 OFR002\n" +
		"PKG3 10 100 OFR003\n" +
		"To end your input, press Ctrl+D (Linux/Mac) or Ctrl+Z then Enter (Windows).\n"
	);
}

const DEFAULT_CURRENCY = 'RM';

function formatPrice(amount: number, currency: string = DEFAULT_CURRENCY): string {
	if (!Number.isFinite(amount)) return String(amount);
	return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function displayResultsTable(results: { packageId: string; discount: number; totalCost: number }[]) {
	console.log('\n--- Delivery Cost Results ---');
	console.log('Package ID | Discount         | Total Cost       ');
	console.log('-----------|------------------|------------------');
	for (const res of results) {
		const discountDisplay = formatPrice(res.discount);
		const totalCostDisplay = formatPrice(res.totalCost);
		console.log(
			`${res.packageId.padEnd(10)} | ${discountDisplay.padStart(16)} | ${totalCostDisplay.padStart(16)}`
		);
	}
	// console.log('');
	// console.log(`Note: "Discount" and "Total Cost" are formatted as currency (${DEFAULT_CURRENCY}), rounded to 2 decimal places, with thousands separator.`);
}
