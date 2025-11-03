# Yoink SDK - Token Price Checker Example

This example demonstrates how to get token prices and market data using the Yoink SDK.

## Features

🪙 **Simple Price Check** - Get basic price information for a token
📊 **Comprehensive Analysis** - Detailed market data including liquidity and fees  
🎯 **Price Impact Simulation** - See how different trade sizes affect price
⚖️ **Token Comparison** - Compare multiple tokens side by side
📡 **Real-time Monitoring** - Track price changes over time

## Setup

1. **Install dependencies:**
   ```bash
   cd /path/to/yoink-sdk/example/price-checker
   npm install
   ```

2. **Create environment file:**
   ```bash
   # Create .env file
   echo "SOLANA_RPC_URL=https://staging-rpc.dev2.eclipsenetwork.xyz" > .env
   ```

3. **Get actual token mint addresses:**
   - Replace the placeholder addresses in `EXAMPLE_TOKENS` with real token mints from your Yoink deployment
   - You can find these by creating tokens through your Yoink dApp or checking existing deployments

## Usage

### Run the Example
```bash
npm start
```

### Basic Price Check
```javascript
const { YoinkSDK } = require("yoink-sdk");
const { getSimplePrice } = require("./index.js");

// Get basic price info
await getSimplePrice(sdk, tokenMint);
```

### Comprehensive Analysis
```javascript
const { getTokenPrice, simulatePriceImpact } = require("./index.js");

// Get detailed market data
const priceData = await getTokenPrice(sdk, tokenMint);

// Simulate different trade sizes
await simulatePriceImpact(sdk, tokenMint);
```

### Real-time Monitoring
```javascript
const { monitorPrice } = require("./index.js");

// Monitor price for 60 seconds
await monitorPrice(sdk, tokenMint, 60);
```

## Example Output

```
🪙 Yoink SDK - Token Price Checker
================================================================================

🔗 Connected to: https://staging-rpc.dev2.eclipsenetwork.xyz

📊 Getting price data for: So11111111111111111111111111111111111111112
------------------------------------------------------------

💰 PRICE INFORMATION:
   Price per Token: 0.000000123 SOL
   Price per Token: $0.000012 (assuming 1 SOL = $100)

📈 MARKET DATA:
   Market Cap: 12.345 SOL
   Market Cap: $1,234.50 (assuming 1 SOL = $100)
   Total Supply: 1.000B
   Circulating Supply: 456.789M
   Bonding Curve Complete: ❌ NO

🏦 LIQUIDITY DATA:
   Virtual Token Reserves: 793.650M
   Virtual SOL Reserves: 8.500 SOL
   Real Token Reserves: 543.210M
   Real SOL Reserves: 4.250 SOL

👥 COMMUNITY DATA:
   Total Buyers: 127
   Early Bird Pool: 0.456 SOL
   Creator Fee Pool: 0.123 SOL
   Treasury Fee Pool: 0.089 SOL

🎯 PRICE IMPACT SIMULATION:
------------------------------------------------------------
💸 Buy 0.01 SOL worth:
   Tokens received: 81.301K
   Effective price: 0.000000123 SOL per token
   Price impact: +0.118%

💸 Buy 0.1 SOL worth:
   Tokens received: 794.268K
   Effective price: 0.000000126 SOL per token
   Price impact: +1.247%
```

## Available Functions

### `getSimplePrice(sdk, mint)`
Returns basic price information for a token.

**Returns:**
```javascript
{
  price: 0.000000123,        // Price per token in SOL
  marketCap: 12.345,         // Market cap in SOL
  complete: false            // Whether bonding curve is complete
}
```

### `getTokenPrice(sdk, mint)`
Returns comprehensive market data including liquidity, fees, and community stats.

### `simulatePriceImpact(sdk, mint)`
Shows price impact for different trade sizes (0.01, 0.1, 0.5, 1.0, 5.0 SOL).

### `compareTokenPrices(sdk, mints[])`
Compares prices across multiple tokens in a table format.

### `monitorPrice(sdk, mint, duration)`
Monitors price changes in real-time for the specified duration (in seconds).

## Integration

You can import and use these functions in your own applications:

```javascript
const { 
  getSimplePrice, 
  getTokenPrice, 
  simulatePriceImpact 
} = require("./price-checker");

// Use in your app
const price = await getSimplePrice(sdk, mintAddress);
console.log(`Current price: ${price.price} SOL`);
```

## Notes

- **Bonding Curve Logic**: Prices are calculated using CPMM (Constant Product Market Maker) formula
- **Fees**: Platform fees (typically ~4%) are included in price calculations
- **Virtual vs Real Reserves**: Virtual reserves determine pricing, real reserves show actual liquidity
- **Price Impact**: Higher impact indicates lower liquidity
- **Graduated Tokens**: When `complete = true`, the token has moved to full DEX liquidity

## Troubleshooting

**"Token not found"**: Make sure you're using a valid mint address from a deployed Yoink token

**RPC errors**: Check your `SOLANA_RPC_URL` and network connectivity

**Import errors**: Ensure the SDK is built: `cd ../.. && npm run build`

## Next Steps

1. Replace example token addresses with real mints
2. Integrate price checking into your trading bot or dApp
3. Set up price alerts using the monitoring functions
4. Build automated trading strategies using price impact data