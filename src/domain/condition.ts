import { Package } from "./package";

export interface ICondition {
	isSatisfiedBy(pkg: Package): boolean;
}

export class WeightCondition implements ICondition {
	constructor(private readonly min: number, private readonly max: number) {}

	isSatisfiedBy(pkg: Package): boolean {
		return pkg.weight >= this.min && pkg.weight <= this.max;
	}
}

export class DistanceCondition implements ICondition {
	constructor(private readonly min: number, private readonly max: number) {}

	isSatisfiedBy(pkg: Package): boolean {
		return pkg.distance >= this.min && pkg.distance <= this.max;
	}
}
