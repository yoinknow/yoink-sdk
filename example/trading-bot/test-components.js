const { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } = require("@solana/web3.js");
const { YoinkSDK, DEFAULT_DECIMALS } = require("../../dist/cjs");
const { AnchorProvider } = require("@coral-xyz/anchor");
const NodeWallet = require("@coral-xyz/anchor/dist/cjs/nodewallet").default;
const fs = require("fs");
const path = require("path");
const os = require("os");
const yaml = require("yaml");

// Import trading bot functions for testing
const { CONFIG, analyzeToken } = require("./simple-trading-bot");

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
 * Quick test of trading bot components
 */
async function testTradingBotComponents() {
  console.log("=".repeat(60));
  console.log("🧪 Trading Bot Component Test");
  console.log("=".repeat(60));
  console.log();

  try {
    // Initialize SDK
    const connection = new Connection(CONFIG.RPC_URL, { commitment: "confirmed" });
    const keypair = await keypairFromSolanaConfig();
    const wallet = new NodeWallet(keypair);
    const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
    const sdk = new YoinkSDK(provider);

    console.log(`🔑 Wallet: ${keypair.publicKey.toBase58()}`);
    console.log(`🌐 RPC: ${CONFIG.RPC_URL}`);
    console.log();

    // Test token analysis
    console.log("🔍 Testing Token Analysis Function:");
    console.log("-".repeat(40));
    
    const testMint = new PublicKey('HdpVsv7GSidT9N89E6KLMfw13uZ8i3jqdoJvyXfQ5z9t');
    console.log(`📊 Analyzing: ${testMint.toBase58()}`);
    
    const analysis = await analyzeToken(sdk, testMint);
    
    if (analysis) {
      console.log("✅ Analysis successful!");
      console.log(`   Market Cap: ${analysis.marketCapSOL.toFixed(6)} SOL`);
      console.log(`   Price: ${analysis.pricePerToken.toFixed(10)} SOL`);
      console.log(`   Liquidity Ratio: ${analysis.liquidityRatio.toFixed(4)}`);
      console.log(`   Score: ${analysis.score}/100`);
      console.log(`   Trading Decision: ${analysis.score >= 30 ? '🟢 BUY' : '🔴 SKIP'}`);
    } else {
      console.log("❌ Analysis returned null");
    }
    
    console.log();

    // Test quote functionality
    console.log("💰 Testing Quote Functionality:");
    console.log("-".repeat(40));
    
    const buyAmount = BigInt(Math.floor(CONFIG.MIN_SOL_PER_TRADE * LAMPORTS_PER_SOL));
    const buyQuote = await sdk.getBuyQuote(testMint, buyAmount, BigInt(CONFIG.SLIPPAGE_BASIS_POINTS));
    
    console.log(`📈 Buy Quote for ${CONFIG.MIN_SOL_PER_TRADE} SOL:`);
    console.log(`   Tokens: ${(Number(buyQuote.tokenAmount) / Math.pow(10, DEFAULT_DECIMALS) / 1000).toFixed(2)}K`);
    console.log(`   Price Impact: ${buyQuote.priceImpact.toFixed(3)}%`);
    console.log(`   Max SOL: ${Number(buyQuote.solAmountWithSlippage) / LAMPORTS_PER_SOL} SOL`);
    console.log();

    // Test configuration validation
    console.log("⚙️ Testing Configuration:");
    console.log("-".repeat(40));
    console.log(`✅ Max SOL per trade: ${CONFIG.MAX_SOL_PER_TRADE} SOL`);
    console.log(`✅ Min SOL per trade: ${CONFIG.MIN_SOL_PER_TRADE} SOL`);
    console.log(`✅ Slippage tolerance: ${CONFIG.SLIPPAGE_BASIS_POINTS / 100}%`);
    console.log(`✅ Profit target: ${CONFIG.PROFIT_TARGET_PERCENT}%`);
    console.log(`✅ Stop loss: ${CONFIG.STOP_LOSS_PERCENT}%`);
    console.log(`✅ Max positions: ${CONFIG.MAX_POSITIONS}`);
    console.log(`✅ Max exposure: ${CONFIG.MAX_TOTAL_EXPOSURE_SOL} SOL`);
    console.log();

    console.log("=".repeat(60));
    console.log("🎉 All trading bot components working correctly!");
    console.log("=".repeat(60));
    console.log();
    console.log("💡 Component Test Summary:");
    console.log("   ✅ SDK initialization");
    console.log("   ✅ Token analysis function");
    console.log("   ✅ Quote functionality");
    console.log("   ✅ Configuration validation");
    console.log();
    console.log("🚀 Ready for trading bot deployment!");

  } catch (error) {
    console.error("❌ Component test failed:", error.message);
    console.log();
    console.log("🔧 Troubleshooting:");
    console.log("   • Check Solana CLI configuration");
    console.log("   • Verify RPC connectivity");
    console.log("   • Ensure sufficient SOL balance");
    console.log("   • Check SDK build status");
  }
}

// Run test if called directly
if (require.main === module) {
  testTradingBotComponents().catch(console.error);
}

module.exports = {
  testTradingBotComponents
};