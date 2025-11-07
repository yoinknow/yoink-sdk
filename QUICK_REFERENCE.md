# Yoink SDK - Quick Reference

## Installation

```bash
npm install yoink-sdk
```

## Basic Setup

```typescript
import { YoinkSDK } from "yoink-sdk";
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

const connection = new Connection("https://staging-rpc.dev2.eclipsenetwork.xyz");
const wallet = new NodeWallet(yourKeypair);
const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
const sdk = new YoinkSDK(provider);
```

## Common Operations

### Buy Tokens

```typescript
const result = await sdk.buy(
  userKeypair,              // Your funded keypair
  mintPublicKey,            // Token mint address
  BigInt(0.1 * LAMPORTS_PER_SOL),  // 0.1 SOL
  BigInt(500),              // 5% slippage
  { unitLimit: 400000, unitPrice: 100000 }  // Priority fees (optional)
);

if (result.success) {
  console.log("Transaction:", result.signature);
}
```

### Sell Tokens

```typescript
const tokenAmount = BigInt(1000000 * Math.pow(10, 6)); // 1M tokens (6 decimals)

const result = await sdk.sell(
  userKeypair,
  mintPublicKey,
  tokenAmount,
  BigInt(500)  // 5% slippage
);
```

### Get Buy Quote

```typescript
const quote = await sdk.getBuyQuote(
  mintPublicKey,
  BigInt(0.1 * LAMPORTS_PER_SOL),
  BigInt(500)
);

console.log("Tokens:", quote.tokenAmount);
console.log("Price Impact:", quote.priceImpact, "%");
```

### Get Sell Quote

```typescript
const quote = await sdk.getSellQuote(
  mintPublicKey,
  tokenAmount,
  BigInt(500)
);

console.log("SOL to receive:", Number(quote.solAmount) / LAMPORTS_PER_SOL);
```

### Get Market Data

```typescript
const curve = await sdk.getBondingCurveAccount(mintPublicKey);

if (curve) {
  console.log("Market Cap:", Number(curve.getMarketCapSOL()) / LAMPORTS_PER_SOL, "SOL");
  console.log("Price:", curve.getPricePerToken() * LAMPORTS_PER_SOL, "SOL/token");
  console.log("Available Tokens:", curve.realTokenReserves.toString());
  console.log("Is Complete:", curve.complete);
}
```

## Slippage Values

| Slippage | Basis Points |
|----------|--------------|
| 0.5%     | `BigInt(50)` |
| 1%       | `BigInt(100)` |
| 2%       | `BigInt(200)` |
| 5%       | `BigInt(500)` |
| 10%      | `BigInt(1000)` |

## Priority Fees

```typescript
const priorityFees = {
  unitLimit: 400000,   // Compute units
  unitPrice: 100000    // Micro-lamports per unit
};
```

## Error Handling

```typescript
const result = await sdk.buy(/* ... */);

if (!result.success) {
  console.error("Error:", result.error);
  
  if (result.error instanceof Error) {
    if (result.error.message.includes("insufficient funds")) {
      // Not enough SOL
    } else if (result.error.message.includes("slippage")) {
      // Price moved, increase slippage
    }
  }
}
```

## Constants

```typescript
import { 
  GLOBAL_ACCOUNT_SEED,    // "global"
  BONDING_CURVE_SEED,     // "bonding-curve"
  HOLDER_STATS_SEED,      // "holder-stats"
  DEFAULT_DECIMALS        // 6
} from "yoink-sdk";
```

## Helper Functions

### Get PDAs

```typescript
const bondingCurvePDA = sdk.getBondingCurvePDA(mintPublicKey);
const globalPDA = sdk.getGlobalPDA();
const holderStatsPDA = sdk.getHolderStatsPDA(mintPublicKey, userPublicKey);
```

## Complete Example

```typescript
import { YoinkSDK } from "yoink-sdk";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

async function tradeExample() {
  // Setup
  const sdk = new YoinkSDK(provider);
  const mint = new PublicKey("YOUR_MINT_ADDRESS");
  const user = Keypair.generate(); // Make sure this has SOL!
  
  // 1. Check market
  const curve = await sdk.getBondingCurveAccount(mint);
  console.log("Market Cap:", Number(curve.getMarketCapSOL()) / LAMPORTS_PER_SOL);
  
  // 2. Get quote
  const buyQuote = await sdk.getBuyQuote(mint, BigInt(0.1 * LAMPORTS_PER_SOL), BigInt(500));
  console.log("Will receive:", buyQuote.tokenAmount, "tokens");
  console.log("Price impact:", buyQuote.priceImpact.toFixed(2), "%");
  
  // 3. Buy if price impact is acceptable
  if (buyQuote.priceImpact < 5) {
    const result = await sdk.buy(user, mint, BigInt(0.1 * LAMPORTS_PER_SOL), BigInt(500));
    console.log("Buy success:", result.success);
    console.log("Signature:", result.signature);
  }
  
  // 4. Later, sell half
  const sellAmount = buyQuote.tokenAmount / BigInt(2);
  const sellQuote = await sdk.getSellQuote(mint, sellAmount, BigInt(500));
  const sellResult = await sdk.sell(user, mint, sellAmount, BigInt(500));
  console.log("Sell success:", sellResult.success);
}
```

## Common Patterns

### Monitor Price

```typescript
async function monitorPrice(mint: PublicKey, intervalMs: number = 10000) {
  setInterval(async () => {
    const curve = await sdk.getBondingCurveAccount(mint);
    if (curve) {
      console.log("Price:", curve.getPricePerToken() * LAMPORTS_PER_SOL, "SOL");
    }
  }, intervalMs);
}
```

### Smart Buy with Price Check

```typescript
async function smartBuy(
  mint: PublicKey,
  solAmount: bigint,
  maxPriceImpact: number = 5
) {
  const quote = await sdk.getBuyQuote(mint, solAmount, BigInt(500));
  
  if (quote.priceImpact > maxPriceImpact) {
    console.log(`Price impact too high: ${quote.priceImpact.toFixed(2)}%`);
    return null;
  }
  
  return await sdk.buy(userKeypair, mint, solAmount, BigInt(500));
}
```

### Get Current Holdings

```typescript
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";

async function getTokenBalance(mint: PublicKey, owner: PublicKey) {
  const ata = await getAssociatedTokenAddress(mint, owner);
  const account = await getAccount(sdk.connection, ata);
  return Number(account.amount) / Math.pow(10, 6); // Assuming 6 decimals
}
```

## Troubleshooting

### "Account not found"
- Token hasn't been created yet on this mint
- Wrong network (check RPC URL)

### "Insufficient funds"
- User doesn't have enough SOL for the transaction
- Include gas fees in calculation

### "Slippage exceeded"
- Price moved too much
- Increase slippage tolerance
- Transaction took too long to confirm

### TypeScript Errors
- Make sure `tsconfig.json` has `"target": "ES2020"` or higher for BigInt support
- Install type definitions: `npm i -D @types/node @types/bn.js`

## Resources

- **Program ID:** `9BSxAV9iRuiT3W7kwhFEkmzfoMo7xZTBdFGRF793JRbC`
- **Default RPC:** `https://staging-rpc.dev2.eclipsenetwork.xyz` (testnet)
- **Solana Mainnet RPC:** `https://api.mainnet-beta.solana.com`
- **Full Docs:** See README.md
