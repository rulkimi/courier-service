import * as readline from "readline";
import { CostCalculator } from "./lib/cost-calculator";
import { PricingService } from "./services/pricing-service";
import { DeliveryTimeEstimationService } from "./services/delivery-time-estimation-service";
import { InputParser } from "./lib/input-parser";
import { OfferFactory } from "./lib/offer-factory";
import { OFFERS } from "./constants/offers";
import { PackageInput } from "./types";
import { displayResultsTable, printInstructions } from "./lib/utils";

async function main() {
	printInstructions();

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: false,
	});

	const lines: string[] = [];
	for await (const line of rl) {
		if (line.trim()) lines.push(line.trim());
	}

	if (lines.length === 0) {
		console.warn("No input was provided. Please see the above instructions and try again.");
		return;
	}

	try {
		const { baseCost, packageCount } = InputParser.parseDeliveryConfig(lines[0]);
		const packageLines = lines.slice(1, packageCount + 1);
		const packageInputs: PackageInput[] = packageLines.map((line) =>
			InputParser.parsePackage(line)
		);

		let vehiclesConfig;
		if (lines.length > packageCount + 1) {
			vehiclesConfig = InputParser.parseVehiclesConfig(lines[packageCount + 1]);
		}

		const offers = OfferFactory.createMany(OFFERS);
		const costCalculator = new CostCalculator();
		const pricingService = new PricingService(costCalculator, offers);
		const timeEstimationService = new DeliveryTimeEstimationService(pricingService);
		
		const results = timeEstimationService.processPackages(baseCost, packageInputs, vehiclesConfig);

		displayResultsTable(results);

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
