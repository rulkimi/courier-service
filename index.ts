#!/usr/bin/env node

import { OFFERS } from "./constants";
import Offer from "./models/offer";

const readline = require("readline");

const offers: Offer[] = OFFERS.map(data => new Offer(data));

function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const lines: string[] = [];

  rl.on("line", (input: string) => {
    if (input.trim()) {
      lines.push(input.trim());
    }
  });

  rl.on("close", () => {
    lines.forEach(line => {
      const [pkgId, weightStr, distanceStr, offerCode] = line.split(/\s+/);

      const weight = parseFloat(weightStr);
      const distance = parseFloat(distanceStr);

      const offer = offers.find(o => o.code === offerCode);

      if (!offer) {
        console.log(`${pkgId}: Offer ${offerCode} not found`);
        return;
      }

      const valid = offer.isValid(distance, weight);

      console.log(`${pkgId}: Offer ${offer.code} valid -> ${valid}`);
    });
  });
}

main();