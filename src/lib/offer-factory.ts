import { DistanceCondition, ICondition, WeightCondition } from "../domain/condition";
import { Offer } from "../domain/offer";
import { IOffer } from "../types";

export class OfferFactory {
	static create(data: IOffer): Offer {
		const conditions: ICondition[] = [];

		if (data.conditions.weight) {
			conditions.push(new WeightCondition(data.conditions.weight.min, data.conditions.weight.max));
		}
		if (data.conditions.distance) {
			conditions.push(new DistanceCondition(data.conditions.distance.min, data.conditions.distance.max));
		}

		return new Offer(data.code, data.discountPercentage, conditions);
	}

	static createMany(dataList: IOffer[]): Offer[] {
		return dataList.map((data) => OfferFactory.create(data));
	}
}
