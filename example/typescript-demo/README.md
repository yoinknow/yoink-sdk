# 🔷 TypeScript Compatibility Guide

The Yoink SDK is **fully compatible with TypeScript** and is built entirely in TypeScript with complete type safety.

## ✅ TypeScript Support Features

- **📝 Full TypeScript Source Code** - Written in TypeScript 5.5+
- **🔍 Complete Type Declarations** - All `.d.ts` files included
- **🎯 Strict Mode Compilation** - Zero TypeScript errors
- **📦 Multiple Module Formats** - ESM, CommonJS, and Browser builds
- **🔢 BigInt Support** - Precise calculations with native BigInt
- **🛡️ Type Safety** - Full IntelliSense and compile-time checking

## 📦 Import Methods

### TypeScript/ES Modules
```typescript
import { YoinkSDK, DEFAULT_DECIMALS } from 'yoink-sdk';
import type { BuyQuote, SellQuote, TransactionResult } from 'yoink-sdk';
```

### JavaScript/CommonJS
```javascript
const { YoinkSDK, DEFAULT_DECIMALS } = require('yoink-sdk');
```

### Browser Bundle
```html
<script src="node_modules/yoink-sdk/dist/browser/index.js"></script>
```

## 🔧 TypeScript Configuration

### Recommended tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "resolveJsonModule": true
  }
}
```

### Package.json Setup
```json
{
  "dependencies": {
    "yoink-sdk": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.5.2",
    "ts-node": "^10.9.2",
    "@types/node": "^20.14.1"
  }
}
```

## 🎯 Type Definitions

### Core Types
```typescript
// Transaction result with full type safety
interface TransactionResult {
  signature?: string;
  error?: unknown;
  results?: VersionedTransactionResponse;
  success: boolean;
}

// Buy quote with BigInt precision
interface BuyQuote {
  tokenAmount: bigint;
  solAmount: bigint;
  solAmountWithSlippage: bigint;
  pricePerToken: number;
  priceImpact: number;
}

// Sell quote with BigInt precision
interface SellQuote {
  tokenAmount: bigint;
  solAmount: bigint;
  solAmountWithSlippage: bigint;
  pricePerToken: number;
  priceImpact: number;
}
```

### Priority Fees
```typescript
interface PriorityFee {
  unitLimit: number;
  unitPrice: number;
}
```

## 🚀 TypeScript Usage Examples

### Basic Setup
```typescript
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { YoinkSDK } from "yoink-sdk";
import { AnchorProvider } from "@coral-xyz/anchor";

// Initialize with full type safety
const connection = new Connection("https://staging-rpc.dev2.eclipsenetwork.xyz");
const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
const sdk: YoinkSDK = new YoinkSDK(provider);
```

### Typed Token Analysis
```typescript
import type { BuyQuote } from "yoink-sdk";

async function analyzeToken(mint: PublicKey): Promise<void> {
  // Get bonding curve with TypeScript inference
  const bondingCurve = await sdk.getBondingCurveAccount(mint);
  
  if (bondingCurve) {
    // All properties are typed
    const marketCap: number = bondingCurve.getMarketCapSOL();
    const price: number = bondingCurve.getPricePerToken();
    const complete: boolean = bondingCurve.complete;
    
    console.log(`Market Cap: ${marketCap}`);
    console.log(`Price: ${price}`);
    console.log(`Complete: ${complete}`);
  }
}
```

### Typed Trading Operations
```typescript
import type { TransactionResult, BuyQuote } from "yoink-sdk";

async function executeTrade(
  keypair: Keypair, 
  mint: PublicKey, 
  solAmount: number
): Promise<TransactionResult> {
  
  // BigInt for precise calculations
  const amount: bigint = BigInt(Math.floor(solAmount * LAMPORTS_PER_SOL));
  const slippage: bigint = BigInt(500); // 5%
  
  // Get typed quote
  const quote: BuyQuote = await sdk.getBuyQuote(mint, amount, slippage);
  
  // Execute with full type safety
  const result: TransactionResult = await sdk.buy(
    keypair,
    mint,
    amount,
    slippage,
    {
      unitLimit: 400000,
      unitPrice: 100000
    }
  );
  
  return result;
}
```

### Generic Type Usage
```typescript
// Custom interfaces extending SDK types
interface TokenAnalysis extends BuyQuote {
  marketCapSOL: number;
  liquidityRatio: number;
  riskScore: number;
}

async function analyzeOpportunity(mint: PublicKey): Promise<TokenAnalysis | null> {
  const bondingCurve = await sdk.getBondingCurveAccount(mint);
  
  if (!bondingCurve) return null;
  
  const quote = await sdk.getBuyQuote(mint, BigInt(1000000), BigInt(500));
  
  return {
    ...quote, // Spread BuyQuote properties
    marketCapSOL: Number(bondingCurve.getMarketCapSOL()) / LAMPORTS_PER_SOL,
    liquidityRatio: Number(bondingCurve.realSolReserves) / Number(bondingCurve.getMarketCapSOL()),
    riskScore: calculateRisk(bondingCurve)
  };
}
```

## 🛠️ Development Tools

### IDE Support
- **VS Code**: Full IntelliSense and autocomplete
- **WebStorm**: Complete TypeScript integration
- **Vim/Neovim**: TypeScript language server support

### Type Checking
```bash
# Check types without compilation
npx tsc --noEmit

# Watch mode for development
npx tsc --watch --noEmit
```

### Build Process
```bash
# SDK includes pre-built declarations
npm install yoink-sdk

# Or build from source
git clone https://github.com/yoinknow/yoink-sdk.git
cd yoink-sdk
npm install
npm run build
```

## 📁 Build Output Structure

```
dist/
├── esm/          # ES Modules + TypeScript declarations
│   ├── index.js
│   ├── index.d.ts
│   ├── yoink.js
│   ├── yoink.d.ts
│   └── ...
├── cjs/          # CommonJS + TypeScript declarations  
│   ├── index.js
│   ├── index.d.ts
│   ├── yoink.js
│   ├── yoink.d.ts
│   └── ...
└── browser/      # Browser bundle
    └── index.js
```

## ⚡ Performance Notes

- **Tree Shaking**: Full support with ES modules
- **Bundle Size**: Optimized TypeScript compilation
- **Type Inference**: Zero runtime overhead
- **BigInt**: Native support for precise calculations

## 🔍 Debugging

### TypeScript Errors
```typescript
// Common issue: Module resolution
import { YoinkSDK } from 'yoink-sdk'; // ✅ Correct
import { YoinkSDK } from 'yoink-sdk/dist/esm'; // ❌ Not needed

// BigInt usage
const amount = BigInt(1000000); // ✅ Correct
const amount = 1000000n; // ✅ Also works (ES2020+)
```

### Type Assertion (if needed)
```typescript
// Rarely needed, but available
const quote = await sdk.getBuyQuote(mint, amount, slippage) as BuyQuote;
```

## 🎉 Conclusion

The Yoink SDK provides **first-class TypeScript support** with:

- ✅ **Zero configuration** required
- ✅ **Complete type safety** out of the box  
- ✅ **Multiple import methods** for any project setup
- ✅ **Full IDE integration** with autocomplete and error checking
- ✅ **BigInt precision** for financial calculations
- ✅ **Modern TypeScript features** (ES2020+ target)

Whether you're building in JavaScript or TypeScript, the SDK provides excellent developer experience with optional type safety when you need it.

---

**Ready to use with TypeScript?** Check out the [typescript-demo](./typescript-demo/) folder for working examples!