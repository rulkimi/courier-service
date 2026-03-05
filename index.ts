#!/usr/bin/env node

import { OFFERS } from "./constants";
import Offer from "./models/offer";

const readline = require("readline");

const offers: Offer[] = OFFERS.map(data => new Offer(data));

function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question("Enter weight, distance, offer code (separated by space): ", function(answer: string) {
    const [weightStr, distanceStr, offerCode] = answer.trim().split(/\s+/);
  
    const weight = parseFloat(weightStr);
    const distance = parseFloat(distanceStr);
  
    const offer = offers.find(o => o.code === offerCode);
  
    if (!offer) {
      console.log(`Offer with name ${offerCode} not found.`);
      rl.close();
      return;
    }
  
    const valid = offer.isValid(distance, weight);
  
    if (!valid) {
      console.log(
        `The given offer code is not valid for the provided weight (${weight}) and distance (${distance}).\n` +
        `Conditions are:\n` +
        `  distance between ${offer.conditions.distance[0]} and ${offer.conditions.distance[1]}\n` +
        `  weight between ${offer.conditions.weight[0]} and ${offer.conditions.weight[1]}.`
      );
    }
  
    console.log(`Offer: ${offer.code}, Is valid: ${valid}`);
  
    rl.close();
  });
}

main();