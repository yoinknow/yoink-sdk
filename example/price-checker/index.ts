import dotenv from "dotenv";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { YoinkSDK, DEFAULT_DECIMALS } from "../../src";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { AnchorProvider } from "@coral-xyz/anchor";

dotenv.config();

/**
 * Get Anchor provider
 */
function getProvider(): AnchorProvider {
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
function formatNumber(num: number, decimals: number = 6): string {
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
function formatSOL(lamports: bigint): string {
  const sol = Number(lamports) / LAMPORTS_PER_SOL;
  return formatNumber(sol, 9);
}

/**
 * Get comprehensive price information for a token
 */
async function getTokenPrice(sdk: YoinkSDK, mint: PublicKey) {
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
async function simulatePriceImpact(sdk: YoinkSDK, mint: PublicKey) {
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
      console.log(`   ❌ Error simulating ${solAmount} SOL trade`);
    }
  }
}

/**
 * Compare prices across multiple tokens
 */
async function compareTokenPrices(sdk: YoinkSDK, mints: PublicKey[]) {
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
async function monitorPrice(sdk: YoinkSDK, mint: PublicKey, duration: number = 60) {
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
      console.log(`❌ ${new Date().toLocaleTimeString()} | Error: ${error}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
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

    // Example token mints - replace with actual token addresses
    const EXAMPLE_TOKENS = [
      "REPLACE_WITH_ACTUAL_MINT_ADDRESS_1",
      "REPLACE_WITH_ACTUAL_MINT_ADDRESS_2",
      "REPLACE_WITH_ACTUAL_MINT_ADDRESS_3"
    ];

    // For this example, let's use the first token
    const targetMint = new PublicKey(EXAMPLE_TOKENS[0]);
    
    console.log("🎯 TARGET TOKEN ANALYSIS:");
    console.log("=".repeat(80));
    
    // 1. Get comprehensive price data
    const priceData = await getTokenPrice(sdk, targetMint);
    
    if (!priceData) {
      console.log("❌ Could not fetch price data. Please check the token mint address.");
      return;
    }

    // 2. Simulate price impact for different trade sizes
    await simulatePriceImpact(sdk, targetMint);

    // 3. Compare with other tokens (if you have multiple mints)
    const allMints = EXAMPLE_TOKENS.map(addr => new PublicKey(addr));
    await compareTokenPrices(sdk, allMints);

    // 4. Ask user if they want to monitor price in real-time
    console.log("💡 Optional: Monitor price changes in real-time? (This would run for 60 seconds)");
    console.log("   Uncomment the line below to enable real-time monitoring:");
    console.log("   // await monitorPrice(sdk, targetMint, 60);");
    console.log();
    
    // Uncomment to enable real-time monitoring:
    // await monitorPrice(sdk, targetMint, 60);

    console.log("✅ Price analysis complete!");
    console.log();
    console.log("💡 Pro Tips:");
    console.log("   • Higher price impact = less liquidity");
    console.log("   • Virtual reserves show bonding curve parameters");
    console.log("   • Real reserves show actual liquidity available");
    console.log("   • Complete = true means bonding curve graduated to full DEX");
    console.log();

  } catch (error) {
    console.error("❌ Error in price checker:", error);
    
    if (error.message.includes("SOLANA_RPC_URL")) {
      console.log();
      console.log("💡 Setup Instructions:");
      console.log("   1. Create a .env file in the project root");
      console.log("   2. Add: SOLANA_RPC_URL=https://staging-rpc.dev2.eclipsenetwork.xyz");
      console.log("   3. Replace EXAMPLE_TOKENS with actual mint addresses");
    }
  }
}

// Run the price checker
if (require.main === module) {
  main().catch(console.error);
}

export { getTokenPrice, simulatePriceImpact, compareTokenPrices, monitorPrice };