````markdown
# Yoink SDK Examples

This directory contains working examples demonstrating how to use the Yoink SDK.

## 📁 Examples

### [Basic Example](./basic/)

A complete example showing:
- SDK initialization
- Fetching global and bonding curve accounts
- Getting buy/sell quotes
- Executing buy transactions
- Executing sell transactions
- Token balance queries

### [Price Checker](./price-checker/)

Comprehensive price analysis and testing examples:
- Real-time price checking
- Market analysis and comparison
- Quote verification against smart contract
- Buy/sell execution testing
- Comprehensive quotation system

### [Trading Bot](./trading-bot/) 🤖

Simple automated trading bot demonstrating:
- Token analysis and scoring system
- Automated buy/sell execution
- Risk management with profit targets and stop losses
- Position monitoring and P&L tracking
- Demo mode for safe testing

### [TypeScript Demo](./typescript-demo/) 🔷

TypeScript compatibility and usage examples:
- Full TypeScript type safety and IntelliSense
- Complete type definitions and interfaces
- BigInt support for precise calculations
- Multiple import methods (ESM, CJS, Browser)
- Development tools and configuration

## 🚀 Quick Start Guide

### Prerequisites

1. **Node.js** v20.14.0 or higher
2. **npm** or **yarn**
3. **Solana CLI** configured with wallet
4. **Sufficient SOL balance** for trading and fees

### Setup

1. **Install dependencies** (from SDK root):
   ```bash
   npm install
   npm run build
   ```

2. **Configure Solana CLI**:
   ```bash
   solana config get
   solana balance
   ```

3. **Choose your example**:
   - **Basic**: Simple SDK functionality demo
   - **Price Checker**: Quote analysis and verification
   - **Trading Bot**: Automated trading with risk management

## 📊 Example Comparison

| Example | Purpose | Risk Level | Complexity | Language |
|---------|---------|------------|------------|----------|
| **Basic** | Learn SDK basics | 🟢 Low | Beginner | JavaScript |
| **Price Checker** | Analyze markets | 🟡 None | Intermediate | JavaScript |
| **Trading Bot** | Automated trading | 🔴 High | Advanced | JavaScript |
| **TypeScript Demo** | TS integration | 🟢 None | Beginner | TypeScript |

## 🎯 Recommended Learning Path

### 1. Start with Basic Example
```bash
cd example/basic
node index.js
```

### 2. Explore Price Analysis
```bash
cd example/price-checker
node quotation-test.js
```

### 3. Try Trading Bot (Demo Mode)
```bash
cd example/trading-bot
node demo-trading-bot.js
```

### 4. TypeScript Integration (Optional)
```bash
cd example/typescript-demo
node simple-typescript-demo.js
```

### 5. Advanced: Live Trading Bot
```bash
cd example/trading-bot
# ⚠️ Use small amounts and monitor closely!
node simple-trading-bot.js
```

## 🚀 Running the Examples

### Prerequisites

1. **Node.js** v20.14.0 or higher
2. **npm** or **yarn**
3. **Solana testnet wallet** with some SOL

### Setup

1. Navigate to the example directory:
   ```bash
   cd example/basic
   ```

2. Install dependencies (if not already installed from root):
   ```bash
   npm install
   # or from SDK root: npm install
   ```

3. Create a `.env` file with your configuration:
   ```bash
   cp ../../.env.example .env
   ```

4. Edit `.env` and add your settings:
   ```env
      ```bash
   # For testnet (current)
   RPC_URL=https://staging-rpc.dev2.eclipsenetwork.xyz
   
   # For Solana mainnet
   # RPC_URL=https://api.mainnet-beta.solana.com
   ```
   PRIVATE_KEY=[your,private,key,array]
   PROGRAM_ID=HbiDw6U515iWwHQ4edjmceT24ST7akg7z5rhXRhBac4J
   ```

5. Update the example code with a valid token mint address:
   ```typescript
   // In index.ts, replace:
   const EXAMPLE_MINT = new PublicKey("REPLACE_WITH_ACTUAL_MINT_ADDRESS");
   
   // With an actual token mint, for example:
   const EXAMPLE_MINT = new PublicKey("5UeBYiWx4GFo8dSFpZRvHUnXvEHv1bkuGS8dPFc7Tze7");
   ```

### Running

```bash
# Compile TypeScript
npm run build

# Run the example
ts-node index.ts
```

Or run directly with ts-node:
```bash
npx ts-node index.ts
```

## 📖 Example Breakdown

### 1. Initialize SDK

```typescript
import { YoinkSDK } from "yoink-sdk";
import { AnchorProvider } from "@coral-xyz/anchor";

const provider = new AnchorProvider(connection, wallet, {
  commitment: "confirmed"
});
const sdk = new YoinkSDK(provider);
```

### 2. Query Bonding Curve

```typescript
const bondingCurve = await sdk.getBondingCurveAccount(mintAddress);
console.log("Market Cap:", bondingCurve.getMarketCapSOL());
console.log("Price per Token:", bondingCurve.getPricePerToken());
```

### 3. Get Buy Quote

```typescript
const buyAmount = BigInt(0.1 * LAMPORTS_PER_SOL);
const slippage = BigInt(500); // 5%

const quote = await sdk.getBuyQuote(mintAddress, buyAmount, slippage);
console.log("Tokens to receive:", quote.tokenAmount);
console.log("Price impact:", quote.priceImpact);
```

### 4. Execute Buy

```typescript
const result = await sdk.buy(
  keypair,
  mintAddress,
  buyAmount,
  slippage,
  {
    unitLimit: 400000,
    unitPrice: 100000
  }
);

if (result.success) {
  console.log("Transaction:", result.signature);
}
```

### 5. Execute Sell

```typescript
const sellAmount = BigInt(1000 * 10**6); // 1000 tokens (6 decimals)

const result = await sdk.sell(
  keypair,
  mintAddress,
  sellAmount,
  slippage,
  {
    unitLimit: 400000,
    unitPrice: 100000
  }
);
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `RPC_URL` | Solana RPC endpoint | Yes | `https://staging-rpc.dev2.eclipsenetwork.xyz` (testnet) or `https://api.mainnet-beta.solana.com` (mainnet) |
| `PRIVATE_KEY` | Wallet private key (JSON array) | Yes | `[1,2,3,...]` |
| `PROGRAM_ID` | Yoink program ID | No | Auto-configured |
| `PRIORITY_FEE_LAMPORTS` | Priority fee in lamports | No | `100000` |
| `PRIORITY_FEE_UNITS` | Compute units for priority fee | No | `200000` |

### Slippage Settings

Slippage is specified in basis points:
- `100` = 1%
- `500` = 5% (recommended)
- `1000` = 10%

Higher slippage = more tolerance for price changes, but less price protection.

### Priority Fees

Priority fees help transactions get processed faster during network congestion:

```typescript
const result = await sdk.buy(
  keypair,
  mintAddress,
  buyAmount,
  slippage,
  {
    unitLimit: 400000,   // Compute units
    unitPrice: 100000    // Micro-lamports per unit
  }
);
```

## 📊 Example Output

```
================================================================================
Yoink SDK Example - Buy and Sell Demo
================================================================================

Test Account: 715Zjd5g9kmUMBNBLDQWtbwqCptUrnCaebUfqkEK19rT
Initial Balance: 335.935130 SOL

Token Mint: 5UeBYiWx4GFo8dSFpZRvHUnXvEHv1bkuGS8dPFc7Tze7

Fetching global account...
Fee Basis Points: 400 (4%)
Fee Recipient: 715Zjd5g9kmUMBNBLDQWtbwqCptUrnCaebUfqkEK19rT

Fetching bonding curve...
✅ Bonding Curve Status:
   Virtual Token Reserves: 1017971561643959
   Virtual SOL Reserves: 31.62170926 SOL
   Market Cap: 31.063450543 SOL
   Price per Token: 0.0000289 SOL

Getting buy quote for 0.01 SOL...
✅ Buy Quote:
   SOL Amount: 0.01 SOL
   Token Amount: 308951.23
   Price Impact: 0.06%

Executing buy transaction...
✅ Buy successful!
   Signature: 3bwAVZr7yjfrn4CqAadjV8odhoYuUjegpJfZe6HC88nMGtcCSWk8ohQt3FPVEPvbRftzhW7prxPVhhvddXZB7BaS
   Token Balance: 308951.23 tokens
   SOL Balance: 335.925010 SOL
```

## 🐛 Troubleshooting

### "Account not found"
- Ensure you're using a valid token mint address
- Verify you're connected to the correct network (testnet vs mainnet)

### "Insufficient balance"
- Fund your wallet with SOL from a faucet (testnet) or transfer (mainnet)
- Check balance with `solana balance <address>`

### "Slippage exceeded"
- Increase slippage tolerance (e.g., from 5% to 10%)
- Try again - prices may have changed rapidly

### "Transaction failed"
- Check the error message for specific details
- Verify bonding curve is not "complete"
- Ensure sufficient compute budget (increase unitLimit)
- Try adding/increasing priority fees

## 🔗 Resources

- [SDK Documentation](../../README.md)
- [API Reference](../../README.md#api-reference)
- [Quick Reference](../../QUICK_REFERENCE.md)
- [Solana Explorer](https://explorer.dev.eclipsenetwork.xyz)

## 💡 Tips

1. **Always test on testnet first** before using mainnet
2. **Start with small amounts** when testing
3. **Use appropriate slippage** - too low may cause failures, too high reduces protection
4. **Check quotes before trading** to understand price impact
5. **Monitor transaction status** using the returned signature and explorer

## 🤝 Need Help?

- [GitHub Issues](https://github.com/memewhales/YoinkIt_SmartContract/issues)
- [GitHub Discussions](https://github.com/memewhales/YoinkIt_SmartContract/discussions)
- [Documentation](../../README.md)
