const { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } = require("@solana/web3.js");
const { YoinkSDK, DEFAULT_DECIMALS } = require("yoink-sdk");
const { AnchorProvider } = require("@coral-xyz/anchor");
const NodeWallet = require("@coral-xyz/anchor/dist/cjs/nodewallet").default;
require("dotenv").config();

/**
 * Get Anchor provider
 */
function getProvider() {
  if (!process.env.SOLANA_RPC_URL) {
    throw new Error("Please set SOLANA_RPC_URL in .env file");
  }

  const connection = new Connection(process.env.SOLANA_RPC_URL);
  const wallet = new NodeWallet(new Keypair());
  return new AnchorProvider(connection, wallet, { commitment: "confirmed" });
}

/**
 * Format number with appropriate decimal places
 */
function formatNumber(num, decimals = 6) {
  if (num === 0) return "0";
  if (num < 0.000001) return num.toExponential(3);
  if (num < 1) return num.toFixed(decimals);
  if (num < 1000) return num.toFixed(3);
  if (num < 1000000) return (num / 1000).toFixed(2) + "K";
  return (num / 1000000).toFixed(2) + "M";
}

/**
 * Format SOL amount with proper decimal places
 */
function formatSOL(lamports) {
  const sol = Number(lamports) / LAMPORTS_PER_SOL;
  return formatNumber(sol, 9);
}

/**
 * Get comprehensive price information for a token
 */
async function getTokenPrice(sdk, mint) {
  console.log(`📊 Getting price data for: ${mint.toBase58()}`);
  console.log("-".repeat(60));

  try {
    // Fetch bonding curve data
    const bondingCurve = await sdk.getBondingCurveAccount(mint);
    
    if (!bondingCurve) {
      console.log("❌ Token not found or not using bonding curve");
      return null;
    }

    // Basic price information
    const pricePerToken = bondingCurve.getPricePerToken();
    const marketCapSOL = bondingCurve.getMarketCapSOL();
    
    console.log("💰 PRICE INFORMATION:");
    console.log(`   Price per Token: ${formatNumber(pricePerToken * LAMPORTS_PER_SOL, 9)} SOL`);
    console.log(`   Price per Token: $${formatNumber(pricePerToken * LAMPORTS_PER_SOL * 100, 6)} (assuming 1 SOL = $100)`);
    console.log();

    console.log("📈 MARKET DATA:");
    console.log(`   Market Cap: ${formatSOL(marketCapSOL)} SOL`);
    console.log(`   Market Cap: $${formatNumber(Number(marketCapSOL) / LAMPORTS_PER_SOL * 100, 2)} (assuming 1 SOL = $100)`);
    console.log(`   Total Supply: ${formatNumber(Number(bondingCurve.tokenTotalSupply) / Math.pow(10, DEFAULT_DECIMALS))}`);
    console.log(`   Circulating Supply: ${formatNumber(Number(bondingCurve.circulatingSupply) / Math.pow(10, DEFAULT_DECIMALS))}`);
    console.log(`   Bonding Curve Complete: ${bondingCurve.complete ? "✅ YES" : "❌ NO"}`);
    console.log();

    console.log("🏦 LIQUIDITY DATA:");
    console.log(`   Virtual Token Reserves: ${formatNumber(Number(bondingCurve.virtualTokenReserves) / Math.pow(10, DEFAULT_DECIMALS))}`);
    console.log(`   Virtual SOL Reserves: ${formatSOL(bondingCurve.virtualSolReserves)} SOL`);
    console.log(`   Real Token Reserves: ${formatNumber(Number(bondingCurve.realTokenReserves) / Math.pow(10, DEFAULT_DECIMALS))}`);
    console.log(`   Real SOL Reserves: ${formatSOL(bondingCurve.realSolReserves)} SOL`);
    console.log();

    console.log("👥 COMMUNITY DATA:");
    console.log(`   Total Buyers: ${bondingCurve.totalBuyers.toString()}`);
    console.log(`   Early Bird Pool: ${formatSOL(bondingCurve.earlyBirdPool)} SOL`);
    console.log(`   Creator Fee Pool: ${formatSOL(bondingCurve.creatorFeePool)} SOL`);
    console.log(`   Treasury Fee Pool: ${formatSOL(bondingCurve.treasuryFeePool)} SOL`);
    console.log();

    return {
      pricePerTokenSOL: pricePerToken,
      marketCapSOL: Number(marketCapSOL) / LAMPORTS_PER_SOL,
      bondingCurve
    };

  } catch (error) {
    console.error("❌ Error fetching token price:", error);
    return null;
  }
}

/**
 * Simulate price impact for different trade sizes
 */
async function simulatePriceImpact(sdk, mint) {
  console.log("🎯 PRICE IMPACT SIMULATION:");
  console.log("-".repeat(60));

  const tradeSizes = [0.01, 0.1, 0.5, 1.0, 5.0]; // SOL amounts
  
  for (const solAmount of tradeSizes) {
    try {
      const buyQuote = await sdk.getBuyQuote(
        mint,
        BigInt(solAmount * LAMPORTS_PER_SOL),
        BigInt(500) // 5% slippage
      );

      console.log(`💸 Buy ${solAmount} SOL worth:`);
      console.log(`   Tokens received: ${formatNumber(Number(buyQuote.tokenAmount) / Math.pow(10, DEFAULT_DECIMALS))}`);
      console.log(`   Effective price: ${formatNumber(buyQuote.pricePerToken * LAMPORTS_PER_SOL, 9)} SOL per token`);
      console.log(`   Price impact: ${buyQuote.priceImpact >= 0 ? '+' : ''}${buyQuote.priceImpact.toFixed(3)}%`);
      console.log();
    } catch (error) {
      console.log(`   ❌ Error simulating ${solAmount} SOL trade: ${error.message}`);
    }
  }
}

/**
 * Compare prices across multiple tokens
 */
async function compareTokenPrices(sdk, mints) {
  console.log("⚖️  TOKEN PRICE COMPARISON:");
  console.log("-".repeat(80));
  console.log(`${"Token".padEnd(20)} | ${"Price (SOL)".padEnd(15)} | ${"Market Cap".padEnd(15)} | ${"Status".padEnd(10)}`);
  console.log("-".repeat(80));

  for (const mint of mints) {
    try {
      const bondingCurve = await sdk.getBondingCurveAccount(mint);
      
      if (!bondingCurve) {
        console.log(`${mint.toBase58().slice(0, 16)}... | ${"Not Found".padEnd(15)} | ${"N/A".padEnd(15)} | ${"❌".padEnd(10)}`);
        continue;
      }

      const price = bondingCurve.getPricePerToken() * LAMPORTS_PER_SOL;
      const marketCap = Number(bondingCurve.getMarketCapSOL()) / LAMPORTS_PER_SOL;
      const status = bondingCurve.complete ? "Complete" : "Active";
      
      console.log(`${mint.toBase58().slice(0, 16)}... | ${formatNumber(price, 9).padEnd(15)} | ${formatNumber(marketCap, 2).padEnd(15)} | ${status.padEnd(10)}`);
      
    } catch (error) {
      console.log(`${mint.toBase58().slice(0, 16)}... | ${"Error".padEnd(15)} | ${"N/A".padEnd(15)} | ${"❌".padEnd(10)}`);
    }
  }
  console.log("-".repeat(80));
}

/**
 * Monitor price changes over time
 */
async function monitorPrice(sdk, mint, duration = 60) {
  console.log(`📡 MONITORING PRICE CHANGES (${duration}s):`);
  console.log("-".repeat(60));

  let previousPrice = 0;
  let iteration = 0;
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < duration * 1000) {
    try {
      const bondingCurve = await sdk.getBondingCurveAccount(mint);
      
      if (bondingCurve) {
        const currentPrice = bondingCurve.getPricePerToken() * LAMPORTS_PER_SOL;
        const timestamp = new Date().toLocaleTimeString();
        
        let changeIndicator = "📊";
        let changeText = "";
        
        if (iteration > 0 && previousPrice > 0) {
          const change = ((currentPrice - previousPrice) / previousPrice) * 100;
          if (change > 0) {
            changeIndicator = "📈";
            changeText = ` (+${change.toFixed(4)}%)`;
          } else if (change < 0) {
            changeIndicator = "📉";
            changeText = ` (${change.toFixed(4)}%)`;
          } else {
            changeIndicator = "➡️";
            changeText = ` (0.0000%)`;
          }
        }
        
        console.log(`${changeIndicator} ${timestamp} | Price: ${formatNumber(currentPrice, 9)} SOL${changeText}`);
        previousPrice = currentPrice;
      } else {
        console.log(`❌ ${new Date().toLocaleTimeString()} | Token not found`);
      }
      
      iteration++;
      await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds
      
    } catch (error) {
      console.log(`❌ ${new Date().toLocaleTimeString()} | Error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

/**
 * Get just the current price - simple version
 */
async function getSimplePrice(sdk, mint) {
  try {
    const bondingCurve = await sdk.getBondingCurveAccount(mint);
    
    if (!bondingCurve) {
      console.log(`❌ Token ${mint.toBase58()} not found`);
      return null;
    }

    const pricePerToken = bondingCurve.getPricePerToken();
    const marketCapSOL = bondingCurve.getMarketCapSOL();
    
    console.log(`🪙 Token: ${mint.toBase58()}`);
    console.log(`💰 Price: ${formatNumber(pricePerToken * LAMPORTS_PER_SOL, 9)} SOL per token`);
    console.log(`📊 Market Cap: ${formatSOL(marketCapSOL)} SOL`);
    console.log(`🎯 Status: ${bondingCurve.complete ? "Graduated" : "Active Bonding Curve"}`);
    
    return {
      price: pricePerToken,
      marketCap: Number(marketCapSOL) / LAMPORTS_PER_SOL,
      complete: bondingCurve.complete
    };
    
  } catch (error) {
    console.error(`❌ Error getting price for ${mint.toBase58()}:`, error.message);
    return null;
  }
}

/**
 * Main function - Token Price Checker
 */
async function main() {
  console.log("=".repeat(80));
  console.log("🪙 Yoink SDK - Token Price Checker");
  console.log("=".repeat(80));
  console.log();

  try {
    // Initialize SDK
    const provider = getProvider();
    const sdk = new YoinkSDK(provider);
    
    console.log(`🔗 Connected to: ${provider.connection.rpcEndpoint}`);
    console.log();

    // Example: Replace these with actual token mint addresses from your Yoink deployment
    const EXAMPLE_TOKENS = [
      "11111111111111111111111111111111",  // Replace with actual mint
      "22222222222222222222222222222222",  // Replace with actual mint
      "33333333333333333333333333333333"   // Replace with actual mint
    ];

    // Method 1: Simple price check
    console.log("🎯 METHOD 1: SIMPLE PRICE CHECK");
    console.log("=".repeat(50));
    
    try {
      const targetMint = new PublicKey(EXAMPLE_TOKENS[0]);
      await getSimplePrice(sdk, targetMint);
    } catch (error) {
      console.log("❌ Invalid mint address in EXAMPLE_TOKENS[0]. Please replace with actual token mint.");
      console.log("   Example format: 'So11111111111111111111111111111111111111112'");
    }
    console.log();

    // Method 2: Comprehensive analysis (uncomment when you have real mints)
    console.log("🎯 METHOD 2: COMPREHENSIVE ANALYSIS");
    console.log("=".repeat(50));
    console.log("💡 To use comprehensive analysis:");
    console.log("   1. Replace EXAMPLE_TOKENS with real mint addresses");
    console.log("   2. Uncomment the analysis code below");
    console.log();
    
    /*
    // Uncomment this section when you have real token mints:
    
    const targetMint = new PublicKey(EXAMPLE_TOKENS[0]);
    
    // Get comprehensive price data
    const priceData = await getTokenPrice(sdk, targetMint);
    
    if (priceData) {
      // Simulate price impact for different trade sizes
      await simulatePriceImpact(sdk, targetMint);

      // Compare with other tokens
      const allMints = EXAMPLE_TOKENS.map(addr => new PublicKey(addr));
      await compareTokenPrices(sdk, allMints);

      // Optional: Monitor price changes (runs for 30 seconds)
      // await monitorPrice(sdk, targetMint, 30);
    }
    */

    console.log("✅ Price analysis complete!");
    console.log();
    console.log("💡 Next Steps:");
    console.log("   1. Get actual token mint addresses from your Yoink deployment");
    console.log("   2. Replace the EXAMPLE_TOKENS array with real mints");
    console.log("   3. Uncomment the comprehensive analysis section");
    console.log("   4. Run: npm start");
    console.log();
    console.log("📖 Available Functions:");
    console.log("   • getSimplePrice(sdk, mint) - Basic price info");
    console.log("   • getTokenPrice(sdk, mint) - Comprehensive analysis");
    console.log("   • simulatePriceImpact(sdk, mint) - Trade impact simulation");
    console.log("   • compareTokenPrices(sdk, mints) - Multi-token comparison");
    console.log("   • monitorPrice(sdk, mint, duration) - Real-time monitoring");

  } catch (error) {
    console.error("❌ Error in price checker:", error);
    
    if (error.message.includes("SOLANA_RPC_URL")) {
      console.log();
      console.log("💡 Setup Instructions:");
      console.log("   1. Create a .env file in this directory");
      console.log("   2. Add: SOLANA_RPC_URL=https://staging-rpc.dev2.eclipsenetwork.xyz");
      console.log("   3. Make sure you have installed dependencies: npm install");
    }
  }
}

// Export functions for use in other modules
module.exports = {
  getTokenPrice,
  getSimplePrice,
  simulatePriceImpact,
  compareTokenPrices,
  monitorPrice
};

// Run the price checker if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}