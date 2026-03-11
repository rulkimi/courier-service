import { InputParser } from "../lib/input-parser";

describe("InputParser", () => {
	describe("parseDeliveryConfig", () => {
		test("should parse valid delivery config", () => {
			const config = InputParser.parseDeliveryConfig("100 3");
			expect(config).toEqual({ baseCost: 100, packageCount: 3 });
		});

		test("should parse config with multiple spaces correctly", () => {
			const config = InputParser.parseDeliveryConfig("  100   3  ");
			expect(config).toEqual({ baseCost: 100, packageCount: 3 });
		});

		test("should throw error when missing parts", () => {
			expect(() => InputParser.parseDeliveryConfig("100")).toThrow(
				"Invalid config format. Expected: <base_delivery_cost> <no_of_packages>"
			);
		});

		test("should throw error when parts are empty space", () => {
			expect(() => InputParser.parseDeliveryConfig(" ")).toThrow(
				"Invalid config format. Expected: <base_delivery_cost> <no_of_packages>"
			);
		});

		test("should throw error for non-numeric input", () => {
			expect(() => InputParser.parseDeliveryConfig("abc 3")).toThrow(
				"Invalid values for config. Delivery cost and no. of packages should be typeof number."
			);
			expect(() => InputParser.parseDeliveryConfig("100 abc")).toThrow(
				"Invalid values for config. Delivery cost and no. of packages should be typeof number."
			);
		});

		test("should handle decimal and non-standard spacing formats", () => {
			const config = InputParser.parseDeliveryConfig(" \t 100.5  \n\r  3 \t");
			expect(config).toEqual({ baseCost: 100.5, packageCount: 3 });
		});
	});

	describe("parsePackage", () => {
		test("should parse valid package without offer code", () => {
			const pkg = InputParser.parsePackage("PKG1 50 30");
			expect(pkg).toEqual({
				id: "PKG1",
				weight: 50,
				distance: 30,
				offerCode: ""
			});
		});

		test("should parse valid package with offer code", () => {
			const pkg = InputParser.parsePackage("PKG2 75 125 OFR008");
			expect(pkg).toEqual({
				id: "PKG2",
				weight: 75,
				distance: 125,
				offerCode: "OFR008"
			});
		});

		test("should parse valid package with multiple spaces", () => {
			const pkg = InputParser.parsePackage("  PKG2    75   125   OFR008  ");
			expect(pkg).toEqual({
				id: "PKG2",
				weight: 75,
				distance: 125,
				offerCode: "OFR008"
			});
		});

		test("should throw error when missing parts", () => {
			expect(() => InputParser.parsePackage("PKG1 50")).toThrow(
				"Invalid package format: PKG1 50. Expected: <pkg_id> <pkg_weight_in_kg> <distance_in_km> <offer_code>"
			);
		});

		test("should throw error when numeric fields are non-numeric", () => {
			expect(() => InputParser.parsePackage("PKG1 abc 30")).toThrow(
				"Invalid values for package PKG1; weight and distance should be typeof number."
			);
			expect(() => InputParser.parsePackage("PKG1 50 abc")).toThrow(
				"Invalid values for package PKG1; weight and distance should be typeof number."
			);
		});

		test("should handle decimals, trailing spaces, missing codes gracefully", () => {
			const pkg1 = InputParser.parsePackage("PKG10 \t 88.55 \t 150.99 \t \n");
			expect(pkg1).toEqual({
				id: "PKG10",
				weight: 88.55,
				distance: 150.99,
				offerCode: ""
			});
			const pkg2 = InputParser.parsePackage("\n\t PKG11 \t 100 \t 100 \t OFR001 \t\n");
			expect(pkg2).toEqual({
				id: "PKG11",
				weight: 100,
				distance: 100,
				offerCode: "OFR001"
			});
		});
	});

	describe("parseVehiclesConfig", () => {
		test("should parse valid vehicles config", () => {
			const config = InputParser.parseVehiclesConfig("2 70 200");
			expect(config).toEqual({
				noOfVehicles: 2,
				maxSpeed: 70,
				maxCarriageWeight: 200
			});
		});

		test("should parse vehicles config with extra spaces", () => {
			const config = InputParser.parseVehiclesConfig("   2     70    200   ");
			expect(config).toEqual({
				noOfVehicles: 2,
				maxSpeed: 70,
				maxCarriageWeight: 200
			});
		});

		test("should throw error when missing parts", () => {
			expect(() => InputParser.parseVehiclesConfig("2 70")).toThrow(
				"Invalid vehicles format: 2 70. Expected: <no_of_vehicles> <max_speed> <max_carriage_weight>"
			);
		});

		test("should throw error for non-numeric input", () => {
			expect(() => InputParser.parseVehiclesConfig("a 70 200")).toThrow("Invalid values for vehicles configuration.");
			expect(() => InputParser.parseVehiclesConfig("2 abc 200")).toThrow("Invalid values for vehicles configuration.");
			expect(() => InputParser.parseVehiclesConfig("2 70 abcd")).toThrow("Invalid values for vehicles configuration.");
		});

		test("should handle decimals and messy trailing spacings", () => {
			const config = InputParser.parseVehiclesConfig("  2.5 \t 70.99 \t 200.5 \t \n");
			expect(config).toEqual({
				noOfVehicles: 2, // parseInt parses 2.5 to 2
				maxSpeed: 70.99,
				maxCarriageWeight: 200.5
			});
		});
	});
});
