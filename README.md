<div align="center">
  <img src="./assets/yoinknow.png" alt="Yoink Logo" width="200"/>
  
  # Yoink SDK

  [![npm version](https://img.shields.io/npm/v/yoink-sdk.svg?style=flat-square)](https://www.npmjs.com/package/yoink-sdk)
  [![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](https://opensource.org/licenses/ISC)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Solana](https://img.shields.io/badge/Solana-Solana-purple?style=flat-square)](https://solana.com/)

  ### 🚀 Official TypeScript SDK for interacting with the Yoink bonding curve protocol on Solana
  
</div>

## ✨ Features

- 🔄 **Buy & Sell Tokens** - Execute trades on custom bonding curves
- 💰 **Price Quotes** - Get accurate quotes before trading
- 📊 **Market Data** - Query bonding curve state and statistics
- 🛡️ **Slippage Protection** - Built-in safeguards against price volatility
- 🔒 **Type-Safe** - Full TypeScript support with detailed types
- 🌐 **Multi-Platform** - Works in Node.js and browser environments
- ⚡ **Priority Fees** - Support for transaction prioritization

## 📦 Installation

```bash
npm install yoink-sdk
```

or

```bash
yarn add yoink-sdk
```

## 🚀 Quick Start

### Setup

Create a `.env` file with your RPC endpoint:

```bash
# For testnet (current configuration)
SOLANA_RPC_URL=https://staging-rpc.dev2.eclipsenetwork.xyz

# For Solana mainnet
# SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### Basic Usage

```typescript
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { YoinkSDK } from "yoink-sdk";
import { AnchorProvider } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

// Initialize connection and provider
const connection = new Connection(process.env.SOLANA_RPC_URL!);
const wallet = new NodeWallet(Keypair.generate());
const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });

// Create SDK instance
const sdk = new YoinkSDK(provider);

// Your token mint address
const mintAddress = new PublicKey("YOUR_TOKEN_MINT_ADDRESS");

// Get bonding curve data
const bondingCurve = await sdk.getBondingCurveAccount(mintAddress);
console.log("Market Cap:", bondingCurve.getMarketCapSOL());
console.log("Price per Token:", bondingCurve.getPricePerToken());

// Get a buy quote
const buyAmount = BigInt(0.1 * LAMPORTS_PER_SOL); // 0.1 SOL
const buyQuote = await sdk.getBuyQuote(mintAddress, buyAmount, BigInt(500)); // 5% slippage
console.log("You will receive:", buyQuote.tokenAmount, "tokens");

// Execute buy
const userKeypair = Keypair.generate(); // Your funded keypair
const buyResult = await sdk.buy(
  userKeypair,
  mintAddress,
  buyAmount,
  BigInt(500), // 5% slippage
  {
    unitLimit: 400000,
    unitPrice: 100000,
  }
);

if (buyResult.success) {
  console.log("Buy successful! Signature:", buyResult.signature);
}
```

## API Reference

### YoinkSDK

#### Constructor

```typescript
constructor(provider?: Provider)
```

Creates a new instance of the Yoink SDK.

**Parameters:**
- `provider` (optional): Anchor Provider instance. If not provided, uses the default provider from environment.

**Example:**
```typescript
const sdk = new YoinkSDK(provider);
```

---

#### `buy()`

```typescript
async buy(
  buyer: Keypair,
  mint: PublicKey,
  solAmount: bigint,
  slippageBasisPoints?: bigint,
  priorityFees?: PriorityFee,
  commitment?: Commitment,
  finality?: Finality
): Promise<TransactionResult>
```

Buy tokens with SOL.

**Parameters:**
- `buyer`: Keypair of the buyer (must have SOL)
- `mint`: PublicKey of the token mint to buy
- `solAmount`: Amount of SOL to spend (in lamports)
- `slippageBasisPoints`: Slippage tolerance (default: 500 = 5%)
- `priorityFees` (optional): Priority fees for transaction
- `commitment` (optional): Transaction commitment level (default: "confirmed")
- `finality` (optional): Transaction finality level (default: "confirmed")

**Returns:** `Promise<TransactionResult>` with transaction signature and success status

**Example:**
```typescript
const result = await sdk.buy(
  userKeypair,
  mintAddress,
  BigInt(0.01 * LAMPORTS_PER_SOL), // 0.01 SOL
  BigInt(500), // 5% slippage
  {
    unitLimit: 400000,
    unitPrice: 100000,
  }
);
```

---

#### `sell()`

```typescript
async sell(
  seller: Keypair,
  mint: PublicKey,
  tokenAmount: bigint,
  slippageBasisPoints?: bigint,
  priorityFees?: PriorityFee,
  commitment?: Commitment,
  finality?: Finality
): Promise<TransactionResult>
```

Sell tokens for SOL.

**Parameters:**
- `seller`: Keypair of the seller (must have tokens)
- `mint`: PublicKey of the token mint to sell
- `tokenAmount`: Amount of tokens to sell (in base units with decimals)
- `slippageBasisPoints`: Slippage tolerance (default: 500 = 5%)
- `priorityFees` (optional): Priority fees for transaction
- `commitment` (optional): Transaction commitment level
- `finality` (optional): Transaction finality level

**Returns:** `Promise<TransactionResult>`

**Example:**
```typescript
const result = await sdk.sell(
  userKeypair,
  mintAddress,
  BigInt(1000000 * Math.pow(10, 6)), // 1M tokens with 6 decimals
  BigInt(500) // 5% slippage
);
```

---

#### `getBuyQuote()`

```typescript
async getBuyQuote(
  mint: PublicKey,
  solAmount: bigint,
  slippageBasisPoints?: bigint,
  commitment?: Commitment
): Promise<BuyQuote>
```

Get a quote for buying tokens without executing the transaction.

**Parameters:**
- `mint`: PublicKey of the token mint
- `solAmount`: Amount of SOL to spend (in lamports)
- `slippageBasisPoints`: Slippage tolerance (default: 500 = 5%)
- `commitment` (optional): Query commitment level

**Returns:** `Promise<BuyQuote>` containing:
- `tokenAmount`: Number of tokens you'll receive
- `solAmount`: SOL amount to spend
- `solAmountWithSlippage`: Max SOL with slippage protection
- `pricePerToken`: Average price per token in SOL
- `priceImpact`: Price impact percentage

**Example:**
```typescript
const quote = await sdk.getBuyQuote(
  mintAddress,
  BigInt(0.1 * LAMPORTS_PER_SOL),
  BigInt(500)
);

console.log(`You will receive ${quote.tokenAmount} tokens`);
console.log(`Price impact: ${quote.priceImpact}%`);
```

---

#### `getSellQuote()`

```typescript
async getSellQuote(
  mint: PublicKey,
  tokenAmount: bigint,
  slippageBasisPoints?: bigint,
  commitment?: Commitment
): Promise<SellQuote>
```

Get a quote for selling tokens without executing the transaction.

**Parameters:**
- `mint`: PublicKey of the token mint
- `tokenAmount`: Amount of tokens to sell (in base units)
- `slippageBasisPoints`: Slippage tolerance (default: 500 = 5%)
- `commitment` (optional): Query commitment level

**Returns:** `Promise<SellQuote>` containing:
- `tokenAmount`: Number of tokens being sold
- `solAmount`: SOL amount you'll receive
- `solAmountWithSlippage`: Min SOL with slippage protection
- `pricePerToken`: Average price per token in SOL
- `priceImpact`: Price impact percentage

**Example:**
```typescript
const quote = await sdk.getSellQuote(
  mintAddress,
  BigInt(1000000 * Math.pow(10, 6)),
  BigInt(500)
);

console.log(`You will receive ${Number(quote.solAmount) / LAMPORTS_PER_SOL} SOL`);
```

---

#### `getBondingCurveAccount()`

```typescript
async getBondingCurveAccount(
  mint: PublicKey,
  commitment?: Commitment
): Promise<BondingCurveAccount | null>
```

Fetch the bonding curve account data for a token.

**Parameters:**
- `mint`: PublicKey of the token mint
- `commitment` (optional): Query commitment level

**Returns:** `Promise<BondingCurveAccount | null>` - Bonding curve data or null if not found

**Example:**
```typescript
const curve = await sdk.getBondingCurveAccount(mintAddress);

if (curve) {
  console.log("Virtual SOL Reserves:", curve.virtualSolReserves);
  console.log("Virtual Token Reserves:", curve.virtualTokenReserves);
  console.log("Market Cap:", curve.getMarketCapSOL());
  console.log("Price per Token:", curve.getPricePerToken());
  console.log("Is Complete:", curve.complete);
}
```

---

#### `getGlobalAccount()`

```typescript
async getGlobalAccount(
  commitment?: Commitment
): Promise<GlobalAccount>
```

Fetch the global protocol configuration.

**Parameters:**
- `commitment` (optional): Query commitment level

**Returns:** `Promise<GlobalAccount>` - Global configuration data

**Example:**
```typescript
const global = await sdk.getGlobalAccount();

console.log("Fee Basis Points:", global.feeBasisPoints);
console.log("Fee Recipient:", global.feeRecipient.toBase58());
console.log("Buybacks Enabled:", global.buybacksEnabled);
```

---

### BondingCurveAccount

The `BondingCurveAccount` class represents the state of a token's bonding curve.

#### Properties

- `virtualTokenReserves: bigint` - Virtual token reserves for pricing
- `virtualSolReserves: bigint` - Virtual SOL reserves for pricing
- `realTokenReserves: bigint` - Actual token reserves available
- `realSolReserves: bigint` - Actual SOL reserves in the curve
- `tokenTotalSupply: bigint` - Total token supply
- `complete: boolean` - Whether the bonding curve is complete
- `creatorFeePool: bigint` - Accumulated creator fees
- `treasuryFeePool: bigint` - Accumulated treasury fees
- `earlyBirdPool: bigint` - Early bird rewards pool
- `totalBuyers: bigint` - Total number of unique buyers

#### Methods

##### `getMarketCapSOL()`

```typescript
getMarketCapSOL(): bigint
```

Calculate the current market cap in lamports.

**Returns:** Market cap in lamports

---

##### `getPricePerToken()`

```typescript
getPricePerToken(): number
```

Get the current price per token in SOL.

**Returns:** Price per token as a decimal number

---

### GlobalAccount

The `GlobalAccount` class represents the global protocol configuration.

#### Properties

- `initialized: boolean` - Whether the protocol is initialized
- `authority: PublicKey` - Protocol authority address
- `feeRecipient: PublicKey` - Address receiving platform fees
- `feeBasisPoints: bigint` - Fee percentage in basis points (e.g., 400 = 4%)
- `initialVirtualTokenReserves: bigint` - Initial virtual token reserves for new curves
- `initialVirtualSolReserves: bigint` - Initial virtual SOL reserves for new curves
- `buybacksEnabled: boolean` - Whether buyback mechanism is enabled
- `earlyBirdEnabled: boolean` - Whether early bird rewards are enabled
- `earlyBirdCutoff: bigint` - Position cutoff for early bird eligibility

---

### Types

#### `TransactionResult`

```typescript
type TransactionResult = {
  signature?: string;
  error?: unknown;
  results?: VersionedTransactionResponse;
  success: boolean;
};
```

#### `BuyQuote`

```typescript
type BuyQuote = {
  tokenAmount: bigint;
  solAmount: bigint;
  solAmountWithSlippage: bigint;
  pricePerToken: number;
  priceImpact: number;
};
```

#### `SellQuote`

```typescript
type SellQuote = {
  tokenAmount: bigint;
  solAmount: bigint;
  solAmountWithSlippage: bigint;
  pricePerToken: number;
  priceImpact: number;
};
```

#### `PriorityFee`

```typescript
type PriorityFee = {
  unitLimit: number;
  unitPrice: number;
};
```

---

## Examples

### Example 1: Simple Buy

```typescript
import { YoinkSDK } from "yoink-sdk";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const sdk = new YoinkSDK(provider);
const buyer = Keypair.generate(); // Make sure this has SOL
const mint = new PublicKey("TOKEN_MINT_ADDRESS");

const result = await sdk.buy(
  buyer,
  mint,
  BigInt(0.1 * LAMPORTS_PER_SOL), // Buy with 0.1 SOL
  BigInt(500) // 5% slippage
);

console.log("Success:", result.success);
console.log("Signature:", result.signature);
```

### Example 2: Get Quote Before Buying

```typescript
// First, get a quote
const quote = await sdk.getBuyQuote(
  mint,
  BigInt(0.1 * LAMPORTS_PER_SOL),
  BigInt(500)
);

console.log(`Buying with 0.1 SOL will get you ${quote.tokenAmount} tokens`);
console.log(`Price impact: ${quote.priceImpact.toFixed(2)}%`);

// If the quote looks good, execute the buy
if (quote.priceImpact < 5) {
  const result = await sdk.buy(buyer, mint, BigInt(0.1 * LAMPORTS_PER_SOL), BigInt(500));
}
```

### Example 3: Monitor Market Data

```typescript
async function monitorMarket(mint: PublicKey) {
  const curve = await sdk.getBondingCurveAccount(mint);
  
  if (!curve) {
    console.log("Bonding curve not found");
    return;
  }

  console.log("Market Stats:");
  console.log("- Market Cap:", Number(curve.getMarketCapSOL()) / LAMPORTS_PER_SOL, "SOL");
  console.log("- Price:", curve.getPricePerToken() * LAMPORTS_PER_SOL, "SOL per token");
  console.log("- Tokens Available:", curve.realTokenReserves.toString());
  console.log("- SOL Reserves:", Number(curve.realSolReserves) / LAMPORTS_PER_SOL, "SOL");
  console.log("- Complete:", curve.complete);
}

// Monitor every 10 seconds
setInterval(() => monitorMarket(mint), 10000);
```

## Constants

```typescript
export const GLOBAL_ACCOUNT_SEED = "global";
export const BONDING_CURVE_SEED = "bonding-curve";
export const HOLDER_STATS_SEED = "holder-stats";
export const DEFAULT_DECIMALS = 6;
```

## Error Handling

The SDK provides detailed error information through the `TransactionResult` type:

```typescript
const result = await sdk.buy(buyer, mint, amount, slippage);

if (!result.success) {
  console.error("Transaction failed:", result.error);
  
  // Check for specific errors
  if (result.error instanceof Error) {
    if (result.error.message.includes("insufficient funds")) {
      console.log("Not enough SOL in wallet");
    } else if (result.error.message.includes("slippage")) {
      console.log("Price moved too much, try increasing slippage");
    }
  }
}
```

## Building and Publishing

### Build the SDK

```bash
npm install
npm run build
```

This creates three output formats:
- `dist/esm/` - ES Module format
- `dist/cjs/` - CommonJS format
- `dist/browser/` - Browser bundle

### Publish to NPM

```bash
npm login
npm publish
```

## Development

### Running the Example

```bash
cd example/basic
npm install
# Set up your .env file with SOLANA_RPC_URL
npx ts-node index.ts
```

## Program Information

- **Program ID:** `HbiDw6U515iWwHQ4edjmceT24ST7akg7z5rhXRhBac4J`
- **Network:** Solana
- **Framework:** Anchor ^0.30.1

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Disclaimer

This software is provided "as is," without warranty of any kind, express or implied. Use at your own risk. The authors take no responsibility for any harm or damage caused by the use of this software.

By using this software, you acknowledge that you have read, understood, and agree to this disclaimer.

## Support

For issues, questions, or contributions, please visit our [GitHub repository](https://github.com/memewhales/yoink-sdk).

---

Built with ❤️ by the Yoink Team
