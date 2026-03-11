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

### Providing Input

Once started, the application will wait for input via standard input (stdin). You should provide the input in the following format:

**Format:**
```text
<base_delivery_cost> <no_of_packages>
<pkg_id_1> <pkg_weight_1> <distance_1> <offer_code_1>
<pkg_id_2> <pkg_weight_2> <distance_2> <offer_code_2>
...
<no_of_vehicles> <max_speed> <max_carriage_weight>
```

*(Note: The last line for vehicle configuration is optional. If omitted, the system will only calculate delivery costs, not delivery time estimates.)*

**Example:**
```text
100 5
PKG1 50 30 OFR001
PKG2 75 125 OFR008
PKG3 175 100 OFR003
PKG4 110 60 OFR002
PKG5 155 95 NA
2 70 200
```

After pasting your input into the terminal, you need to signal the end of input (EOF) so the program starts processing:
- **Mac/Linux:** Press `Ctrl + D`
- **Windows:** Press `Ctrl + Z`, then hit `Enter`

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

The project is structured under the `src/` directory with clear separation of concerns:
- **domain**: Core models containing business logic (`package.ts`, `offer.ts`).
- **lib**: Utility modules and factory wrappers (`input-parser.ts`, `offer-factory.ts`, `cost-calculator.ts`).
- **services**: Higher-level orchestration logic for determining pricing and shipment delivery times (`pricing-service.ts`, `delivery-time-estimation-service.ts`).
- **constants**: Hardcoded system constants, including configured valid offers (`offers.ts`).