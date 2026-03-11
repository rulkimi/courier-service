# Courier Service

A command-line application specifically designed to calculate the delivery cost and estimated delivery time for packages based on various current offers, package weights, distances, and vehicle availability constraints.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Setup

First, initialize the repository and install all necessary dependencies:

```bash
npm install
```

## How to Run the Application

You can execute the application in development mode using `ts-node`:

```bash
npm start
```
## Running Tests

The project includes an extensive test suite leveraging Jest. To run the tests (which include unit tests and integration tests), use:

```bash
npm test
```

To run tests with coverage information:

```bash
npx jest --coverage
```

## Building for Production

If you want to build the project into JavaScript:

```bash
npm run build
```

This will run TypeScript compilation and output the files to the `dist/` directory.

## Architecture

The project is structured under the `src/` directory with clear separation of concerns, heavily adhering to OOP and SOLID design principles:
- **domain**: Core models containing business logic (`package.ts`, `offer.ts`). Models are independent and easily testable.
- **lib**: Utility modules, parsing classes, and factory wrappers (`input-parser.ts`, `offer-factory.ts`, `cost-calculator.ts`).
- **services**: Higher-level orchestration logic for determining pricing and complex shipment delivery permutations (`pricing-service.ts`, `delivery-time-estimation-service.ts`). Decoupled and relies on dependency injection.
- **constants**: Hardcoded system constants, including configured valid offers (`offers.ts`).

## Assumptions & Trade-Offs

**Assumptions:**
1. **Input Batch Context:** It is assumed that the CLI tool receives small-to-moderate batches of input (e.g., `< 50` packages per execution), making combinatorial exact-matching feasible.
2. **Fail-Fast Error Handling:** The CLI strictly favors a "fail-fast" pipeline if invalid inputs or typings occur (e.g., entering `PKG3 %` as a weight instead of a number). Rather than keeping the program alive and indefinitely prompting the user, the application is designed to cleanly throw parse exceptions and shut down immediately. This enables predictable execution when piping from external `.txt` scripts (e.g., `cat input.txt | npm start`).

**Algorithmic Trade-Offs:**
1. **Time Complexity vs Exact Constraints (0/1 Knapsack):** To ensure maximum possible weight allocation per vehicle trip while strictly tying identical-weighted limits to route arrival times, my shipment selector algorithm evaluates the `findCombinations` using an exhaustive `O(2^n)` subset-sum exploration tree.
   - *Trade-off:* While remarkably accurate for ensuring the specific mathematical constraints requested, it evaluates sub-optimally at immense scales (thousands of packages simultaneously).

## Next Steps (If I had more time)

1. **Interactive CLI / RESTful API:** Because of the tight domain boundary architecture, the application core logic is purely independent of standard inputs. I would introduce an interactive library (like `inquirer.js`) to re-prompt users specifically upon input failure rather than exiting immediately. Alternatively, I would expose this tightly coupled `services` layer directly into an Express or NestJS REST API pipeline.
2. **Persistent Logging & Persistence Strategies:** Moving away from transient memory stores by plugging in a data-persistence layer via a relational Database repository (e.g., PostgreSQL for orders tracking) or a Winston-based asynchronous logging pipeline.