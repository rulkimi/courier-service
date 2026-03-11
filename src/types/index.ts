export interface Range {
	min: number;
	max: number;
}

export interface OfferConditions {
	weight?: Range;
	distance?: Range;
	[key: string]: any;
}

export interface IOffer {
	code: string;
	discountPercentage: number;
	conditions: OfferConditions;
}

export interface PackageInput {
	id: string;
	weight: number;
	distance: number;
	offerCode: string;
}

export interface PricingResult {
	packageId: string;
	discount: number;
	totalCost: number;
}

export interface vehiclesConfig {
	noOfVehicles: number;
	maxSpeed: number;
	maxCarriageWeight: number;
}

export interface DeliveryResult extends PricingResult {
	estimatedDeliveryTime?: number;
}
