import * as readline from "readline";
import { CostCalculator } from "./lib/cost-calculator";
import { PricingService } from "./services/pricing-service";
import { InputParser } from "./lib/input-parser";
import { OfferFactory } from "./lib/offer-factory";
import { OFFERS } from "./constants/offers";
import { PackageInput } from "./types";

async function main() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: false,
	});

	const lines: string[] = [];
	for await (const line of rl) {
		if (line.trim()) lines.push(line.trim());
	}

	if (lines.length === 0) return;

	try {
		const { baseCost, packageCount } = InputParser.parseConfig(lines[0]);
		const packageLines = lines.slice(1, packageCount + 1);
		const packageInputs: PackageInput[] = packageLines.map((line) =>
			InputParser.parsePackage(line)
		);

		const offers = OfferFactory.createMany(OFFERS);
		const costCalculator = new CostCalculator();
		const pricingService = new PricingService(costCalculator, offers);
		const results = pricingService.processPackages(baseCost, packageInputs);

		results.forEach((res) => {
			console.log(`${res.packageId} ${res.discount} ${res.totalCost}`);
		});
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Error: ${error.message}`);
		} else {
			console.error("An unknown error occurred");
		}
		process.exit(1);
	}
}

main();
