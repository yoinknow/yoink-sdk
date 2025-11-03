const { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } = require("@solana/web3.js");
const { YoinkSDK, DEFAULT_DECIMALS } = require("../../dist/cjs");
const { AnchorProvider } = require("@coral-xyz/anchor");
const NodeWallet = require("@coral-xyz/anchor/dist/cjs/nodewallet").default;
const fs = require("fs");
const path = require("path");
const os = require("os");
const yaml = require("yaml");

// Import trading bot functions
const { CONFIG, analyzeToken, calculatePositionPnL } = require("./simple-trading-bot");

// Demo configuration (safer parameters)
const DEMO_CONFIG = {
  ...CONFIG,
  MAX_SOL_PER_TRADE: 0.001,        // Much smaller amounts for demo
  MIN_SOL_PER_TRADE: 0.0005,       // Minimum demo trade
  MAX_TOTAL_EXPOSURE_SOL: 0.005,   // Limited exposure for demo
  MAX_POSITIONS: 2,                // Limited positions for demo
  SCAN_INTERVAL_MS: 15000,         // Faster scanning for demo
};

/**
 * Load keypair from Solana CLI config
 */
async function keypairFromSolanaConfig() {
  try {
    const cfgPath = path.resolve(os.homedir(), ".config", "solana", "cli", "config.yml");
    const cfgData = fs.readFileSync(cfgPath, "utf8");
    const cfg = yaml.parse(cfgData);
    
    const secretKeyData = fs.readFileSync(cfg.keypair_path, "utf8");
    const secret = Uint8Array.from(JSON.parse(secretKeyData));
    const keypair = Keypair.fromSecretKey(secret);
    
    return keypair;
  } catch (error) {
    console.error("❌ Error loading keypair:", error.message);
    throw error;
  }
}

/**
 * Get SDK instance
 */
async function getSDK() {
  const connection = new Connection(DEMO_CONFIG.RPC_URL, { commitment: "confirmed" });
  const keypair = await keypairFromSolanaConfig();
  const wallet = new NodeWallet(keypair);
  const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
  
  return {
    sdk: new YoinkSDK(provider),
    keypair,
    connection
  };
}

/**
 * Demo: Analyze tokens without trading
 */
async function demoTokenAnalysis() {
  console.log("=".repeat(80));
  console.log("🤖 Trading Bot Demo - Token Analysis");
  console.log("=".repeat(80));
  console.log();

  try {
    const { sdk, keypair } = await getSDK();
    console.log(`🔑 Wallet: ${keypair.publicKey.toBase58()}`);
    console.log();

    // Test tokens for analysis
    const testTokens = [
      'HdpVsv7GSidT9N89E6KLMfw13uZ8i3jqdoJvyXfQ5z9t',
      '5UeBYiWx4GFo8dSFpZRvHUnXvEHv1bkuGS8dPFc7Tze7'
    ];

    console.log("🔍 TOKEN ANALYSIS RESULTS:");
    console.log("-".repeat(80));
    console.log(`${"Token".padEnd(20)} | ${"Market Cap".padEnd(12)} | ${"Liquidity".padEnd(10)} | ${"Score".padEnd(6)} | ${"Decision".padEnd(12)}`);
    console.log("-".repeat(80));

    const analyses = [];

    for (const tokenStr of testTokens) {
      try {
        const mint = new PublicKey(tokenStr);
        const analysis = await analyzeToken(sdk, mint);
        
        if (analysis) {
          analyses.push(analysis);
          
          const decision = analysis.score >= 30 ? "🟢 BUY" : 
                          analysis.score >= 20 ? "🟡 MAYBE" : "🔴 SKIP";
          
          console.log(
            `${tokenStr.slice(0, 16)}... | ` +
            `${analysis.marketCapSOL.toFixed(2).padEnd(12)} | ` +
            `${analysis.liquidityRatio.toFixed(3).padEnd(10)} | ` +
            `${analysis.score.toString().padEnd(6)} | ` +
            `${decision.padEnd(12)}`
          );
        } else {
          console.log(`${tokenStr.slice(0, 16)}... | ${"N/A".padEnd(12)} | ${"N/A".padEnd(10)} | ${"0".padEnd(6)} | ${"🔴 SKIP".padEnd(12)}`);
        }
        
      } catch (error) {
        console.log(`${tokenStr.slice(0, 16)}... | ${"ERROR".padEnd(12)} | ${"ERROR".padEnd(10)} | ${"0".padEnd(6)} | ${"❌ ERROR".padEnd(12)}`);
      }
    }
    
    console.log("-".repeat(80));
    console.log();

    // Show detailed analysis for best token
    const bestAnalysis = analyses.sort((a, b) => b.score - a.score)[0];
    
    if (bestAnalysis) {
      console.log("🎯 DETAILED ANALYSIS - BEST OPPORTUNITY:");
      console.log("-".repeat(50));
      console.log(`Token: ${bestAnalysis.mint.toBase58()}`);
      console.log(`Market Cap: ${bestAnalysis.marketCapSOL.toFixed(6)} SOL`);
      console.log(`Price per Token: ${bestAnalysis.pricePerToken.toFixed(10)} SOL`);
      console.log(`Liquidity Ratio: ${bestAnalysis.liquidityRatio.toFixed(4)}`);
      console.log(`Real SOL Reserves: ${bestAnalysis.realSolReserves.toFixed(6)} SOL`);
      console.log(`Real Token Reserves: ${(bestAnalysis.realTokenReserves / 1000000).toFixed(2)}M tokens`);
      console.log(`Trading Volume Est: ${bestAnalysis.tradingVolume.toFixed(6)} SOL`);
      console.log(`Overall Score: ${bestAnalysis.score}/100`);
      console.log();

      // Simulate buy quote
      const buyAmount = BigInt(Math.floor(DEMO_CONFIG.MIN_SOL_PER_TRADE * LAMPORTS_PER_SOL));
      const buyQuote = await sdk.getBuyQuote(
        bestAnalysis.mint,
        buyAmount,
        BigInt(DEMO_CONFIG.SLIPPAGE_BASIS_POINTS)
      );

      console.log("📊 SIMULATED TRADE QUOTE:");
      console.log("-".repeat(30));
      console.log(`Investment: ${DEMO_CONFIG.MIN_SOL_PER_TRADE} SOL`);
      console.log(`Tokens to receive: ${(Number(buyQuote.tokenAmount) / Math.pow(10, DEFAULT_DECIMALS) / 1000).toFixed(2)}K tokens`);
      console.log(`Effective price: ${buyQuote.pricePerToken.toFixed(10)} SOL per token`);
      console.log(`Price impact: ${buyQuote.priceImpact.toFixed(3)}%`);
      console.log(`Max SOL with slippage: ${Number(buyQuote.solAmountWithSlippage) / LAMPORTS_PER_SOL} SOL`);
      console.log();
    }

    console.log("💡 TRADING BOT STRATEGY:");
    console.log("-".repeat(40));
    console.log("✅ Scoring Factors:");
    console.log("   • Liquidity ratio (SOL reserves vs market cap)");
    console.log("   • Market cap range (prefer mid-cap tokens)");
    console.log("   • Trading volume estimation");
    console.log("   • Token distribution metrics");
    console.log();
    console.log("🎯 Entry Criteria:");
    console.log(`   • Minimum score: 30/100`);
    console.log(`   • Market cap: ${DEMO_CONFIG.MIN_MARKET_CAP_SOL}-${CONFIG.MAX_MARKET_CAP_SOL} SOL`);
    console.log(`   • Max positions: ${DEMO_CONFIG.MAX_POSITIONS}`);
    console.log(`   • Max exposure: ${DEMO_CONFIG.MAX_TOTAL_EXPOSURE_SOL} SOL`);
    console.log();
    console.log("🚨 Risk Management:");
    console.log(`   • Profit target: ${CONFIG.PROFIT_TARGET_PERCENT}%`);
    console.log(`   • Stop loss: ${CONFIG.STOP_LOSS_PERCENT}%`);
    console.log(`   • Position sizing: ${DEMO_CONFIG.MIN_SOL_PER_TRADE}-${DEMO_CONFIG.MAX_SOL_PER_TRADE} SOL`);
    console.log(`   • Diversification enabled`);
    console.log();

  } catch (error) {
    console.error("❌ Demo failed:", error.message);
  }
}

/**
 * Demo: Show trading bot configuration and features
 */
async function demoTradingBotFeatures() {
  console.log("=".repeat(80));
  console.log("🤖 Trading Bot Features Overview");
  console.log("=".repeat(80));
  console.log();

  console.log("🔧 CONFIGURATION:");
  console.log("-".repeat(40));
  console.log(`RPC URL: ${DEMO_CONFIG.RPC_URL}`);
  console.log(`Max SOL per trade: ${DEMO_CONFIG.MAX_SOL_PER_TRADE} SOL`);
  console.log(`Min SOL per trade: ${DEMO_CONFIG.MIN_SOL_PER_TRADE} SOL`);
  console.log(`Slippage tolerance: ${DEMO_CONFIG.SLIPPAGE_BASIS_POINTS / 100}%`);
  console.log(`Profit target: ${CONFIG.PROFIT_TARGET_PERCENT}%`);
  console.log(`Stop loss: ${CONFIG.STOP_LOSS_PERCENT}%`);
  console.log(`Scan interval: ${DEMO_CONFIG.SCAN_INTERVAL_MS / 1000} seconds`);
  console.log(`Max positions: ${DEMO_CONFIG.MAX_POSITIONS}`);
  console.log(`Max total exposure: ${DEMO_CONFIG.MAX_TOTAL_EXPOSURE_SOL} SOL`);
  console.log();

  console.log("🎯 TRADING STRATEGY:");
  console.log("-".repeat(40));
  console.log("1. 🔍 Token Analysis:");
  console.log("   • Scans bonding curve tokens for opportunities");
  console.log("   • Analyzes market cap, liquidity, and trading volume");
  console.log("   • Scores tokens based on multiple factors");
  console.log("   • Filters out completed bonding curves");
  console.log();
  
  console.log("2. 📈 Position Management:");
  console.log("   • Opens positions in highest-scoring tokens");
  console.log("   • Monitors positions for profit/loss");
  console.log("   • Automatically executes profit-taking and stop-losses");
  console.log("   • Maintains position size limits and diversification");
  console.log();
  
  console.log("3. 🚨 Risk Management:");
  console.log("   • Dynamic position sizing based on token score");
  console.log("   • Maximum exposure limits to prevent over-investment");
  console.log("   • Stop-loss orders to limit downside risk");
  console.log("   • Profit-taking orders to lock in gains");
  console.log();

  console.log("🤖 BOT WORKFLOW:");
  console.log("-".repeat(40));
  console.log("1. 🔄 Continuous Loop:");
  console.log("   ├── Monitor existing positions for P&L");
  console.log("   ├── Check profit targets and stop losses");
  console.log("   ├── Execute sells when conditions are met");
  console.log("   ├── Scan for new trading opportunities");
  console.log("   ├── Analyze and score potential tokens");
  console.log("   ├── Execute buys for best opportunities");
  console.log("   └── Wait for next scan interval");
  console.log();

  console.log("📊 MONITORING & REPORTING:");
  console.log("-".repeat(40));
  console.log("• Real-time position tracking");
  console.log("• P&L calculation and reporting");
  console.log("• Trade history logging");
  console.log("• Performance analytics");
  console.log("• Risk exposure monitoring");
  console.log();

  console.log("⚙️ USAGE:");
  console.log("-".repeat(40));
  console.log("Demo Mode (Safe):");
  console.log("  node demo-trading-bot.js");
  console.log();
  console.log("Live Trading (Use with caution!):");
  console.log("  node simple-trading-bot.js");
  console.log();
  console.log("Stop Bot:");
  console.log("  Press Ctrl+C to gracefully shutdown");
  console.log();

  console.log("⚠️  IMPORTANT DISCLAIMERS:");
  console.log("-".repeat(40));
  console.log("🔴 This is a DEMO trading bot for educational purposes");
  console.log("🔴 Use small amounts and test thoroughly before scaling");
  console.log("🔴 Cryptocurrency trading involves significant risk");
  console.log("🔴 Past performance does not guarantee future results");
  console.log("🔴 Always monitor bot performance and market conditions");
  console.log("🔴 Consider market volatility and slippage in your strategy");
  console.log();
}

/**
 * Main demo function
 */
async function main() {
  console.log("🚀 Welcome to the Yoink SDK Trading Bot Demo!");
  console.log();

  try {
    // Show bot features and configuration
    await demoTradingBotFeatures();
    
    // Wait for user to continue
    console.log("Press Enter to continue with token analysis demo...");
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });
    
    // Run token analysis demo
    await demoTokenAnalysis();
    
    console.log();
    console.log("=".repeat(80));
    console.log("🎉 DEMO COMPLETED");
    console.log("=".repeat(80));
    console.log("💡 Next Steps:");
    console.log("   • Review the trading bot configuration");
    console.log("   • Adjust parameters for your risk tolerance");
    console.log("   • Test with small amounts in demo mode");
    console.log("   • Monitor performance and refine strategy");
    console.log();
    console.log("🚀 To run the live trading bot:");
    console.log("   node simple-trading-bot.js");
    console.log();
    console.log("⚠️  Remember: Start with small amounts and test thoroughly!");

  } catch (error) {
    console.error("❌ Demo failed:", error.message);
  }
}

// Run demo if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  DEMO_CONFIG,
  demoTokenAnalysis,
  demoTradingBotFeatures
};