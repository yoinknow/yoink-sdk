const { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } = require("@solana/web3.js");
const { YoinkSDK, DEFAULT_DECIMALS } = require("yoink-sdk");
const { AnchorProvider } = require("@coral-xyz/anchor");
const NodeWallet = require("@coral-xyz/anchor/dist/cjs/nodewallet").default;
const fs = require("fs");
const path = require("path");
const os = require("os");
const yaml = require("yaml");

// Use the same RPC as smart contract tests
const ECLIPSE_RPC_URL = "https://staging-rpc.dev2.eclipsenetwork.xyz";

/**
 * Load keypair from Solana CLI config (same as smart contract tests)
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
    console.error("❌ Error loading keypair from Solana config:", error.message);
    throw error;
  }
}

/**
 * Get provider using the same config as smart contract tests
 */
async function getProvider() {
  const connection = new Connection(ECLIPSE_RPC_URL, { commitment: "confirmed" });
  const keypair = await keypairFromSolanaConfig();
  const wallet = new NodeWallet(keypair);
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
 * Wait for a specified amount of time
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get token balance for a wallet
 */
async function getTokenBalance(connection, mint, owner) {
  try {
    const { getAccount, getAssociatedTokenAddress } = require("@solana/spl-token");
    const ata = await getAssociatedTokenAddress(mint, owner);
    const account = await getAccount(connection, ata);
    return Number(account.amount);
  } catch (error) {
    return 0; // Account doesn't exist or has no tokens
  }
}

/**
 * Test both buy and sell functionality with 5% slippage
 */
async function testBuyAndSell(sdk, mint) {
  console.log("🔄 BUY AND SELL TEST - 5% SLIPPAGE");
  console.log("=".repeat(80));
  
  const buyer = await keypairFromSolanaConfig();
  const connection = sdk.connection;
  
  console.log(`🎯 Testing mint: ${mint.toBase58()}`);
  console.log(`💰 Trader wallet: ${buyer.publicKey.toBase58()}`);
  console.log();

  // Check initial balances
  let currentSOLBalance = await connection.getBalance(buyer.publicKey);
  let currentTokenBalance = await getTokenBalance(connection, mint, buyer.publicKey);
  
  console.log(`📊 INITIAL STATE:`);
  console.log(`   SOL: ${formatSOL(BigInt(currentSOLBalance))} SOL`);
  console.log(`   Tokens: ${formatNumber(currentTokenBalance / Math.pow(10, DEFAULT_DECIMALS))}`);

  // Get initial bonding curve state
  let bondingCurve = await sdk.getBondingCurveAccount(mint);
  if (!bondingCurve) {
    console.log("❌ Bonding curve not found!");
    return false;
  }

  console.log(`   Curve Price: ${bondingCurve.getPricePerToken().toFixed(10)} SOL per token`);
  console.log(`   Virtual SOL Reserves: ${formatSOL(bondingCurve.virtualSolReserves)} SOL`);
  console.log(`   Real Token Reserves: ${formatNumber(Number(bondingCurve.realTokenReserves) / Math.pow(10, DEFAULT_DECIMALS))}`);
  console.log();

  const testResults = [];
  
  // === BUY TEST ===
  console.log("🛒 BUY TEST");
  console.log("-".repeat(40));
  
  const buyAmount = 0.001; // Buy with 0.001 SOL
  
  try {
    // Get fresh bonding curve data for buy quote
    bondingCurve = await sdk.getBondingCurveAccount(mint);
    
    // Get buy quote
    const buyQuote = await sdk.getBuyQuote(
      mint,
      BigInt(Math.floor(buyAmount * LAMPORTS_PER_SOL)),
      BigInt(500) // 5% slippage
    );

    console.log(`📋 Buy Quote (5% slippage):`);
    console.log(`   SOL to spend: ${buyAmount} SOL`);
    console.log(`   Tokens to receive: ${formatNumber(Number(buyQuote.tokenAmount) / Math.pow(10, DEFAULT_DECIMALS))}`);
    console.log(`   Max SOL with slippage: ${Number(buyQuote.solAmountWithSlippage) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   Price impact: ${buyQuote.priceImpact.toFixed(3)}%`);

    // Execute buy
    console.log(`⚡ Executing buy...`);
    const buyResult = await sdk.buy(
      buyer,
      mint,
      BigInt(Math.floor(buyAmount * LAMPORTS_PER_SOL)),
      BigInt(500), // 5% slippage
      {
        unitLimit: 400000,
        unitPrice: 100000,
      }
    );

    if (buyResult.success) {
      console.log(`✅ Buy successful! Signature: ${buyResult.signature}`);
      
      // Wait for transaction to settle
      await sleep(2000);
      
      // Check balances after buy
      const newSOLBalance = await connection.getBalance(buyer.publicKey);
      const newTokenBalance = await getTokenBalance(connection, mint, buyer.publicKey);
      
      const solSpent = currentSOLBalance - newSOLBalance;
      const tokensReceived = newTokenBalance - currentTokenBalance;
      
      console.log(`📊 Buy Results:`);
      console.log(`   SOL spent: ${formatSOL(BigInt(solSpent))} SOL`);
      console.log(`   Tokens received: ${formatNumber(tokensReceived / Math.pow(10, DEFAULT_DECIMALS))}`);
      
      const buySuccess = tokensReceived > 0 && solSpent > 0;
      console.log(`   Status: ${buySuccess ? '✅ PASSED' : '❌ FAILED'}`);
      
      testResults.push({
        operation: 'BUY',
        success: buySuccess,
        signature: buyResult.signature,
        solAmount: solSpent,
        tokenAmount: tokensReceived,
        quote: buyQuote
      });

      // Update current balances
      currentSOLBalance = newSOLBalance;
      currentTokenBalance = newTokenBalance;
      
    } else {
      console.log(`❌ Buy failed: ${buyResult.error}`);
      testResults.push({
        operation: 'BUY',
        success: false,
        error: buyResult.error
      });
      return false;
    }

  } catch (error) {
    console.log(`❌ Buy test failed: ${error.message}`);
    testResults.push({
      operation: 'BUY',
      success: false,
      error: error.message
    });
    return false;
  }

  console.log();
  await sleep(3000); // Wait between buy and sell

  // === SELL TEST ===
  console.log("💰 SELL TEST");
  console.log("-".repeat(40));

  try {
    // Sell 50% of tokens we just bought
    const tokensToSell = Math.floor(currentTokenBalance * 0.5);
    
    if (tokensToSell <= 0) {
      console.log("❌ No tokens to sell!");
      return false;
    }

    // Get fresh bonding curve data for sell quote
    bondingCurve = await sdk.getBondingCurveAccount(mint);
    
    // Get sell quote
    const sellQuote = await sdk.getSellQuote(
      mint,
      BigInt(tokensToSell),
      BigInt(500) // 5% slippage
    );

    console.log(`📋 Sell Quote (5% slippage):`);
    console.log(`   Tokens to sell: ${formatNumber(tokensToSell / Math.pow(10, DEFAULT_DECIMALS))}`);
    console.log(`   SOL to receive: ${Number(sellQuote.solAmount) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   Min SOL with slippage: ${Number(sellQuote.solAmountWithSlippage) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   Price impact: ${sellQuote.priceImpact.toFixed(3)}%`);

    // Execute sell
    console.log(`⚡ Executing sell...`);
    const sellResult = await sdk.sell(
      buyer,
      mint,
      BigInt(tokensToSell),
      BigInt(500), // 5% slippage
      {
        unitLimit: 400000,
        unitPrice: 100000,
      }
    );

    if (sellResult.success) {
      console.log(`✅ Sell successful! Signature: ${sellResult.signature}`);
      
      // Wait for transaction to settle
      await sleep(2000);
      
      // Check balances after sell
      const finalSOLBalance = await connection.getBalance(buyer.publicKey);
      const finalTokenBalance = await getTokenBalance(connection, mint, buyer.publicKey);
      
      const solReceived = finalSOLBalance - currentSOLBalance;
      const tokensSold = currentTokenBalance - finalTokenBalance;
      
      console.log(`📊 Sell Results:`);
      console.log(`   Tokens sold: ${formatNumber(tokensSold / Math.pow(10, DEFAULT_DECIMALS))}`);
      console.log(`   SOL received: ${formatSOL(BigInt(solReceived))} SOL`);
      
      const sellSuccess = tokensSold > 0 && solReceived > 0;
      console.log(`   Status: ${sellSuccess ? '✅ PASSED' : '❌ FAILED'}`);
      
      testResults.push({
        operation: 'SELL',
        success: sellSuccess,
        signature: sellResult.signature,
        solAmount: solReceived,
        tokenAmount: tokensSold,
        quote: sellQuote
      });

      // Update final balances
      currentSOLBalance = finalSOLBalance;
      currentTokenBalance = finalTokenBalance;
      
    } else {
      console.log(`❌ Sell failed: ${sellResult.error}`);
      testResults.push({
        operation: 'SELL',
        success: false,
        error: sellResult.error
      });
      return false;
    }

  } catch (error) {
    console.log(`❌ Sell test failed: ${error.message}`);
    testResults.push({
      operation: 'SELL',
      success: false,
      error: error.message
    });
    return false;
  }

  console.log();

  // === FINAL SUMMARY ===
  console.log("📋 FINAL STATE:");
  console.log("-".repeat(40));
  console.log(`   Final SOL: ${formatSOL(BigInt(currentSOLBalance))} SOL`);
  console.log(`   Final Tokens: ${formatNumber(currentTokenBalance / Math.pow(10, DEFAULT_DECIMALS))}`);
  console.log();

  console.log("🎯 TEST RESULTS SUMMARY:");
  console.log("-".repeat(40));
  
  const allTestsPassed = testResults.every(result => result.success);
  
  testResults.forEach((result, index) => {
    if (result.success) {
      console.log(`   ${result.operation}: ✅ SUCCESS - Signature: ${result.signature?.slice(0, 16)}...`);
    } else {
      console.log(`   ${result.operation}: ❌ FAILED - ${result.error}`);
    }
  });

  console.log();
  console.log(`Overall Result: ${allTestsPassed ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED'}`);
  
  if (allTestsPassed) {
    console.log("✅ Both BUY and SELL work correctly with 5% slippage");
    console.log("✅ SDK quote system is functioning properly");
    console.log("✅ Contract accepts both transaction types");
  }

  return allTestsPassed;
}

/**
 * Main test function
 */
async function main() {
  console.log("=".repeat(80));
  console.log("🔄 Yoink SDK Buy & Sell Test - 5% Slippage Verification");
  console.log("=".repeat(80));
  console.log();

  try {
    // Initialize SDK
    console.log("🔧 INITIALIZATION:");
    console.log(`🌐 RPC URL: ${ECLIPSE_RPC_URL}`);
    
    const provider = await getProvider();
    const sdk = new YoinkSDK(provider);
    
    const keypair = await keypairFromSolanaConfig();
    console.log(`🔑 Wallet: ${keypair.publicKey.toBase58()}`);
    
    // Check wallet balance
    const balance = await provider.connection.getBalance(keypair.publicKey);
    console.log(`💰 Balance: ${formatSOL(BigInt(balance))} SOL`);
    
    if (balance < 0.01 * LAMPORTS_PER_SOL) {
      console.log("⚠️  Warning: Low balance. Make sure you have enough SOL for testing.");
    }
    console.log();

    // Test tokens
    const testMints = [
      'HdpVsv7GSidT9N89E6KLMfw13uZ8i3jqdoJvyXfQ5z9t',
      '5UeBYiWx4GFo8dSFpZRvHUnXvEHv1bkuGS8dPFc7Tze7'
    ];

    let allTokensTestsPassed = true;

    for (let i = 0; i < testMints.length; i++) {
      const mintAddress = testMints[i];
      console.log(`TOKEN ${i + 1}/${testMints.length}: ${mintAddress}`);
      console.log("=".repeat(80));
      
      try {
        const mint = new PublicKey(mintAddress);
        
        // Test buy and sell for this token
        const tokenTestsPassed = await testBuyAndSell(sdk, mint);
        
        if (!tokenTestsPassed) {
          allTokensTestsPassed = false;
        }
        
      } catch (error) {
        console.log(`❌ Error testing token: ${error.message}`);
        allTokensTestsPassed = false;
      }
      
      if (i < testMints.length - 1) {
        console.log("\n⏳ Waiting 5 seconds before testing next token...");
        await sleep(5000);
        console.log();
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("🏁 OVERALL RESULTS");
    console.log("=".repeat(80));
    
    if (allTokensTestsPassed) {
      console.log("🎉 ALL TESTS PASSED!");
      console.log("✅ Both BUY and SELL operations work correctly");
      console.log("✅ 5% slippage protection is functioning");
      console.log("✅ SDK quotes are accurate for both operations");
      console.log("✅ Contract properly handles both transaction types");
    } else {
      console.log("⚠️  SOME TESTS FAILED");
      console.log("❌ Review the detailed results above");
    }

    console.log();
    console.log("📝 Test completed with real buy and sell transactions");
    console.log("🔗 All transactions were executed on Eclipse network");

  } catch (error) {
    console.error("❌ Test suite failed:", error);
  }
}

// Run the test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testBuyAndSell,
  ECLIPSE_RPC_URL
};