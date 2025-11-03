const { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } = require("@solana/web3.js");
const { YoinkSDK, DEFAULT_DECIMALS } = require("../../dist/cjs");
const { AnchorProvider } = require("@coral-xyz/anchor");
const NodeWallet = require("@coral-xyz/anchor/dist/cjs/nodewallet").default;
const fs = require("fs");
const path = require("path");
const os = require("os");
const yaml = require("yaml");

// Trading Bot Configuration
const CONFIG = {
  // Network settings
  RPC_URL: "https://staging-rpc.dev2.eclipsenetwork.xyz",
  
  // Trading parameters
  MAX_SOL_PER_TRADE: 0.01,           // Maximum SOL to spend per trade
  MIN_SOL_PER_TRADE: 0.001,          // Minimum SOL to spend per trade
  SLIPPAGE_BASIS_POINTS: 500,        // 5% slippage tolerance
  PROFIT_TARGET_PERCENT: 10,         // Target 10% profit before selling
  STOP_LOSS_PERCENT: -20,           // Stop loss at -20%
  
  // Bot behavior
  SCAN_INTERVAL_MS: 30000,          // Scan markets every 30 seconds
  MAX_POSITIONS: 3,                 // Maximum number of open positions
  MIN_MARKET_CAP_SOL: 1,            // Minimum market cap to consider
  MAX_MARKET_CAP_SOL: 100,          // Maximum market cap to consider
  
  // Risk management
  MAX_TOTAL_EXPOSURE_SOL: 0.05,     // Maximum total SOL at risk
  DIVERSIFICATION_ENABLED: true,     // Don't put all money in one token
};

// Trading bot state
let botState = {
  isRunning: false,
  positions: new Map(),           // tokenMint -> position info
  totalInvested: 0,              // Total SOL currently invested
  trades: [],                    // Trading history
  profits: 0,                    // Total realized profits
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
 * Get provider and SDK instance
 */
async function getSDK() {
  const connection = new Connection(CONFIG.RPC_URL, { commitment: "confirmed" });
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
 * Format numbers for display
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
 * Get current token balance
 */
async function getTokenBalance(sdk, mint, owner) {
  try {
    const { getAccount, getAssociatedTokenAddress } = require("@solana/spl-token");
    const ata = await getAssociatedTokenAddress(mint, owner);
    const account = await getAccount(sdk.connection, ata);
    return Number(account.amount);
  } catch (e) {
    return 0;
  }
}

/**
 * Calculate position PnL (profit/loss)
 */
async function calculatePositionPnL(sdk, position) {
  try {
    const currentBalance = await getTokenBalance(sdk, position.mint, position.owner);
    
    if (currentBalance === 0) {
      // Position was fully sold
      return position.realizedPnL || 0;
    }
    
    // Get current sell quote
    const sellQuote = await sdk.getSellQuote(
      position.mint,
      BigInt(currentBalance),
      BigInt(CONFIG.SLIPPAGE_BASIS_POINTS)
    );
    
    const currentValue = Number(sellQuote.solAmountWithSlippage) / LAMPORTS_PER_SOL;
    const unrealizedPnL = currentValue - position.invested;
    const unrealizedPnLPercent = (unrealizedPnL / position.invested) * 100;
    
    return {
      currentValue,
      unrealizedPnL,
      unrealizedPnLPercent,
      tokenBalance: currentBalance
    };
  } catch (error) {
    console.log(`⚠️ Error calculating PnL for ${position.mint.toBase58()}: ${error.message}`);
    return { currentValue: 0, unrealizedPnL: -position.invested, unrealizedPnLPercent: -100 };
  }
}

/**
 * Analyze token for trading opportunity
 */
async function analyzeToken(sdk, mint) {
  try {
    const bondingCurve = await sdk.getBondingCurveAccount(mint);
    
    if (!bondingCurve || bondingCurve.complete) {
      return null; // Skip completed bonding curves
    }
    
    const marketCapSOL = Number(bondingCurve.getMarketCapSOL()) / LAMPORTS_PER_SOL;
    const pricePerToken = bondingCurve.getPricePerToken();
    const realSolReserves = Number(bondingCurve.realSolReserves) / LAMPORTS_PER_SOL;
    const realTokenReserves = Number(bondingCurve.realTokenReserves) / Math.pow(10, DEFAULT_DECIMALS);
    
    // Basic filtering criteria
    if (marketCapSOL < CONFIG.MIN_MARKET_CAP_SOL || marketCapSOL > CONFIG.MAX_MARKET_CAP_SOL) {
      return null;
    }
    
    // Calculate liquidity ratio (higher is better)
    const liquidityRatio = realSolReserves / marketCapSOL;
    
    // Simple momentum indicator (would be better with price history)
    const tradingVolume = realSolReserves; // Approximation
    
    // Score the token (simple scoring system)
    let score = 0;
    
    // Liquidity scoring
    if (liquidityRatio > 0.1) score += 30;
    else if (liquidityRatio > 0.05) score += 20;
    else if (liquidityRatio > 0.02) score += 10;
    
    // Market cap scoring (prefer mid-cap)
    if (marketCapSOL >= 10 && marketCapSOL <= 50) score += 20;
    else if (marketCapSOL >= 5 && marketCapSOL <= 80) score += 10;
    
    // Volume scoring
    if (tradingVolume > 2) score += 15;
    else if (tradingVolume > 1) score += 10;
    else if (tradingVolume > 0.5) score += 5;
    
    // Token supply scoring (prefer more distributed)
    if (realTokenReserves < marketCapSOL * 500000) score += 10; // Lower supply relative to market cap
    
    return {
      mint,
      marketCapSOL,
      pricePerToken,
      liquidityRatio,
      tradingVolume,
      score,
      realSolReserves,
      realTokenReserves
    };
    
  } catch (error) {
    console.log(`⚠️ Error analyzing ${mint.toBase58()}: ${error.message}`);
    return null;
  }
}

/**
 * Execute a buy order
 */
async function executeBuy(sdk, keypair, analysis) {
  try {
    console.log(`🛒 Attempting to buy ${analysis.mint.toBase58()}`);
    console.log(`   Market Cap: ${analysis.marketCapSOL.toFixed(3)} SOL`);
    console.log(`   Score: ${analysis.score}`);
    
    // Determine buy amount based on score and available funds
    const baseAmount = CONFIG.MIN_SOL_PER_TRADE;
    const scoreMultiplier = Math.min(analysis.score / 50, 2); // Max 2x multiplier
    const buyAmountSOL = Math.min(
      baseAmount * scoreMultiplier,
      CONFIG.MAX_SOL_PER_TRADE,
      CONFIG.MAX_TOTAL_EXPOSURE_SOL - botState.totalInvested
    );
    
    if (buyAmountSOL < CONFIG.MIN_SOL_PER_TRADE) {
      console.log(`⚠️ Insufficient funds or exposure limit reached`);
      return null;
    }
    
    const buyAmount = BigInt(Math.floor(buyAmountSOL * LAMPORTS_PER_SOL));
    
    // Get buy quote
    const buyQuote = await sdk.getBuyQuote(
      analysis.mint,
      buyAmount,
      BigInt(CONFIG.SLIPPAGE_BASIS_POINTS)
    );
    
    console.log(`   Buying ${buyAmountSOL.toFixed(6)} SOL worth`);
    console.log(`   Expected tokens: ${formatNumber(Number(buyQuote.tokenAmount) / Math.pow(10, DEFAULT_DECIMALS))}`);
    console.log(`   Price impact: ${buyQuote.priceImpact.toFixed(2)}%`);
    
    // Execute the trade
    const result = await sdk.buy(
      keypair,
      analysis.mint,
      buyAmount,
      BigInt(CONFIG.SLIPPAGE_BASIS_POINTS),
      {
        unitLimit: 400000,
        unitPrice: 100000,
      }
    );
    
    if (result.success) {
      const position = {
        mint: analysis.mint,
        owner: keypair.publicKey,
        invested: buyAmountSOL,
        tokensReceived: Number(buyQuote.tokenAmount),
        entryPrice: buyQuote.pricePerToken,
        timestamp: Date.now(),
        analysis: analysis,
        realizedPnL: 0
      };
      
      botState.positions.set(analysis.mint.toBase58(), position);
      botState.totalInvested += buyAmountSOL;
      
      const trade = {
        type: 'BUY',
        mint: analysis.mint.toBase58(),
        amount: buyAmountSOL,
        price: buyQuote.pricePerToken,
        timestamp: Date.now(),
        signature: result.signature
      };
      botState.trades.push(trade);
      
      console.log(`✅ Buy successful! Signature: ${result.signature}`);
      console.log(`   Position opened: ${formatNumber(position.tokensReceived / Math.pow(10, DEFAULT_DECIMALS))} tokens`);
      
      return position;
    } else {
      console.log(`❌ Buy failed: ${result.error}`);
      return null;
    }
    
  } catch (error) {
    console.log(`❌ Error executing buy: ${error.message}`);
    return null;
  }
}

/**
 * Execute a sell order
 */
async function executeSell(sdk, keypair, position, reason) {
  try {
    console.log(`💰 Attempting to sell ${position.mint.toBase58()} (${reason})`);
    
    const currentBalance = await getTokenBalance(sdk, position.mint, position.owner);
    
    if (currentBalance === 0) {
      console.log(`⚠️ No tokens to sell`);
      return null;
    }
    
    // Get sell quote
    const sellQuote = await sdk.getSellQuote(
      position.mint,
      BigInt(currentBalance),
      BigInt(CONFIG.SLIPPAGE_BASIS_POINTS)
    );
    
    const expectedSOL = Number(sellQuote.solAmountWithSlippage) / LAMPORTS_PER_SOL;
    console.log(`   Selling ${formatNumber(currentBalance / Math.pow(10, DEFAULT_DECIMALS))} tokens`);
    console.log(`   Expected SOL: ${expectedSOL.toFixed(6)}`);
    
    // Execute the trade
    const result = await sdk.sell(
      keypair,
      position.mint,
      BigInt(currentBalance),
      BigInt(CONFIG.SLIPPAGE_BASIS_POINTS),
      {
        unitLimit: 400000,
        unitPrice: 100000,
      }
    );
    
    if (result.success) {
      const actualSOL = expectedSOL; // Approximation
      const pnl = actualSOL - position.invested;
      const pnlPercent = (pnl / position.invested) * 100;
      
      // Update position
      position.realizedPnL = pnl;
      botState.totalInvested -= position.invested;
      botState.profits += pnl;
      
      const trade = {
        type: 'SELL',
        mint: position.mint.toBase58(),
        amount: actualSOL,
        price: sellQuote.pricePerToken,
        pnl: pnl,
        pnlPercent: pnlPercent,
        timestamp: Date.now(),
        signature: result.signature,
        reason: reason
      };
      botState.trades.push(trade);
      
      console.log(`✅ Sell successful! Signature: ${result.signature}`);
      console.log(`   PnL: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(6)} SOL (${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%)`);
      
      // Remove position
      botState.positions.delete(position.mint.toBase58());
      
      return { pnl, pnlPercent, trade };
    } else {
      console.log(`❌ Sell failed: ${result.error}`);
      return null;
    }
    
  } catch (error) {
    console.log(`❌ Error executing sell: ${error.message}`);
    return null;
  }
}

/**
 * Monitor existing positions
 */
async function monitorPositions(sdk, keypair) {
  console.log(`📊 Monitoring ${botState.positions.size} positions...`);
  
  for (const [mintStr, position] of botState.positions) {
    try {
      const pnlData = await calculatePositionPnL(sdk, position);
      
      if (!pnlData.tokenBalance || pnlData.tokenBalance === 0) {
        // Position already sold, remove it
        botState.positions.delete(mintStr);
        continue;
      }
      
      console.log(`   ${mintStr.slice(0, 8)}... PnL: ${pnlData.unrealizedPnL >= 0 ? '+' : ''}${pnlData.unrealizedPnL.toFixed(6)} SOL (${pnlData.unrealizedPnLPercent >= 0 ? '+' : ''}${pnlData.unrealizedPnLPercent.toFixed(2)}%)`);
      
      // Check for profit target
      if (pnlData.unrealizedPnLPercent >= CONFIG.PROFIT_TARGET_PERCENT) {
        console.log(`🎯 Profit target reached for ${mintStr.slice(0, 8)}...`);
        await executeSell(sdk, keypair, position, `Profit target (${pnlData.unrealizedPnLPercent.toFixed(2)}%)`);
      }
      // Check for stop loss
      else if (pnlData.unrealizedPnLPercent <= CONFIG.STOP_LOSS_PERCENT) {
        console.log(`🛑 Stop loss triggered for ${mintStr.slice(0, 8)}...`);
        await executeSell(sdk, keypair, position, `Stop loss (${pnlData.unrealizedPnLPercent.toFixed(2)}%)`);
      }
      
    } catch (error) {
      console.log(`⚠️ Error monitoring position ${mintStr.slice(0, 8)}...: ${error.message}`);
    }
  }
}

/**
 * Scan for new trading opportunities
 */
async function scanForOpportunities(sdk, keypair) {
  console.log(`🔍 Scanning for trading opportunities...`);
  
  // Check if we can open new positions
  if (botState.positions.size >= CONFIG.MAX_POSITIONS) {
    console.log(`⚠️ Maximum positions (${CONFIG.MAX_POSITIONS}) reached`);
    return;
  }
  
  if (botState.totalInvested >= CONFIG.MAX_TOTAL_EXPOSURE_SOL) {
    console.log(`⚠️ Maximum exposure (${CONFIG.MAX_TOTAL_EXPOSURE_SOL} SOL) reached`);
    return;
  }
  
  // For this demo, we'll analyze our known test tokens
  const testTokens = [
    'HdpVsv7GSidT9N89E6KLMfw13uZ8i3jqdoJvyXfQ5z9t',
    '5UeBYiWx4GFo8dSFpZRvHUnXvEHv1bkuGS8dPFc7Tze7'
  ];
  
  const opportunities = [];
  
  for (const tokenStr of testTokens) {
    try {
      // Skip if we already have a position in this token
      if (botState.positions.has(tokenStr)) {
        continue;
      }
      
      const mint = new PublicKey(tokenStr);
      const analysis = await analyzeToken(sdk, mint);
      
      if (analysis && analysis.score > 30) { // Minimum score threshold
        opportunities.push(analysis);
      }
    } catch (error) {
      console.log(`⚠️ Error analyzing ${tokenStr}: ${error.message}`);
    }
  }
  
  // Sort by score (best opportunities first)
  opportunities.sort((a, b) => b.score - a.score);
  
  console.log(`   Found ${opportunities.length} potential opportunities`);
  
  // Execute best opportunity if available
  if (opportunities.length > 0) {
    const bestOpp = opportunities[0];
    console.log(`🎯 Best opportunity: ${bestOpp.mint.toBase58().slice(0, 8)}... (Score: ${bestOpp.score})`);
    
    await executeBuy(sdk, keypair, bestOpp);
  } else {
    console.log(`   No suitable opportunities found`);
  }
}

/**
 * Print bot status
 */
function printBotStatus() {
  console.log("\n" + "=".repeat(80));
  console.log("🤖 TRADING BOT STATUS");
  console.log("=".repeat(80));
  console.log(`⏰ ${new Date().toLocaleString()}`);
  console.log(`🏃 Running: ${botState.isRunning ? 'YES' : 'NO'}`);
  console.log(`💼 Open Positions: ${botState.positions.size}/${CONFIG.MAX_POSITIONS}`);
  console.log(`💰 Total Invested: ${botState.totalInvested.toFixed(6)} SOL`);
  console.log(`📈 Total Profits: ${botState.profits >= 0 ? '+' : ''}${botState.profits.toFixed(6)} SOL`);
  console.log(`📊 Total Trades: ${botState.trades.length}`);
  
  if (botState.positions.size > 0) {
    console.log(`\n💼 OPEN POSITIONS:`);
    for (const [mintStr, position] of botState.positions) {
      console.log(`   ${mintStr.slice(0, 16)}... | Invested: ${position.invested.toFixed(6)} SOL | Entry: ${position.entryPrice.toFixed(10)} SOL`);
    }
  }
  
  if (botState.trades.length > 0) {
    console.log(`\n📊 RECENT TRADES (last 5):`);
    const recentTrades = botState.trades.slice(-5);
    for (const trade of recentTrades) {
      const time = new Date(trade.timestamp).toLocaleTimeString();
      if (trade.type === 'BUY') {
        console.log(`   ${time} | BUY  | ${trade.mint.slice(0, 8)}... | ${trade.amount.toFixed(6)} SOL`);
      } else {
        console.log(`   ${time} | SELL | ${trade.mint.slice(0, 8)}... | ${trade.amount.toFixed(6)} SOL | PnL: ${trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(6)} SOL (${trade.pnlPercent >= 0 ? '+' : ''}${trade.pnlPercent.toFixed(2)}%)`);
      }
    }
  }
  
  console.log("=".repeat(80));
}

/**
 * Main trading bot loop
 */
async function runTradingBot() {
  console.log("🚀 Starting Simple Trading Bot...");
  console.log(`📡 RPC: ${CONFIG.RPC_URL}`);
  console.log(`⚙️ Max SOL per trade: ${CONFIG.MAX_SOL_PER_TRADE}`);
  console.log(`⚙️ Max positions: ${CONFIG.MAX_POSITIONS}`);
  console.log(`⚙️ Profit target: ${CONFIG.PROFIT_TARGET_PERCENT}%`);
  console.log(`⚙️ Stop loss: ${CONFIG.STOP_LOSS_PERCENT}%`);
  console.log(`⚙️ Scan interval: ${CONFIG.SCAN_INTERVAL_MS / 1000}s`);
  
  try {
    const { sdk, keypair, connection } = await getSDK();
    console.log(`🔑 Wallet: ${keypair.publicKey.toBase58()}`);
    
    // Check initial balance
    const balance = await connection.getBalance(keypair.publicKey);
    const balanceSOL = balance / LAMPORTS_PER_SOL;
    console.log(`💰 Initial balance: ${balanceSOL.toFixed(6)} SOL`);
    
    if (balanceSOL < CONFIG.MAX_TOTAL_EXPOSURE_SOL) {
      console.log(`⚠️ Warning: Low balance for trading. Consider funding the account.`);
    }
    
    botState.isRunning = true;
    
    // Main trading loop
    while (botState.isRunning) {
      try {
        printBotStatus();
        
        // Monitor existing positions
        if (botState.positions.size > 0) {
          await monitorPositions(sdk, keypair);
        }
        
        // Scan for new opportunities
        await scanForOpportunities(sdk, keypair);
        
        console.log(`\n⏳ Waiting ${CONFIG.SCAN_INTERVAL_MS / 1000} seconds until next scan...`);
        console.log(`   Press Ctrl+C to stop the bot`);
        
        // Wait for next cycle
        await new Promise(resolve => setTimeout(resolve, CONFIG.SCAN_INTERVAL_MS));
        
      } catch (error) {
        console.error(`❌ Error in trading loop: ${error.message}`);
        console.log(`⏳ Continuing in 10 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
    
  } catch (error) {
    console.error(`❌ Failed to start trading bot: ${error.message}`);
  }
}

/**
 * Graceful shutdown
 */
process.on('SIGINT', () => {
  console.log(`\n🛑 Received stop signal. Shutting down trading bot...`);
  botState.isRunning = false;
  
  setTimeout(() => {
    printBotStatus();
    console.log(`\n🏁 Trading bot stopped.`);
    console.log(`💡 Final Stats:`);
    console.log(`   • Total trades executed: ${botState.trades.length}`);
    console.log(`   • Total realized profits: ${botState.profits >= 0 ? '+' : ''}${botState.profits.toFixed(6)} SOL`);
    console.log(`   • Open positions: ${botState.positions.size}`);
    process.exit(0);
  }, 1000);
});

// Export for testing
module.exports = {
  CONFIG,
  botState,
  analyzeToken,
  calculatePositionPnL,
  runTradingBot
};

// Run if called directly
if (require.main === module) {
  runTradingBot().catch(console.error);
}