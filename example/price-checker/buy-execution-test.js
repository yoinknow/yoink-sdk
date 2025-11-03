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

        console.log(`📁 Loading keypair from: ${cfg.keypair_path}`);

        const secretKeyData = fs.readFileSync(cfg.keypair_path, "utf8");
        const secret = Uint8Array.from(JSON.parse(secretKeyData));
        const keypair = Keypair.fromSecretKey(secret);

        console.log(`🔑 Loaded wallet: ${keypair.publicKey.toBase58()}`);
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
 * Test buy functionality - compares quotes vs actual execution
 */
async function testBuyExecution(sdk, mint, testAmounts) {
    console.log("🧪 BUY EXECUTION TEST");
    console.log("=".repeat(80));

    const provider = sdk.program.provider;
    const buyer = await keypairFromSolanaConfig(); // Get the keypair directly

    console.log(`🎯 Testing mint: ${mint.toBase58()}`);
    console.log(`💰 Buyer wallet: ${buyer.publicKey.toBase58()}`);

    // Check initial balances
    const initialSOLBalance = await provider.connection.getBalance(buyer.publicKey);
    const initialTokenBalance = await getTokenBalance(provider.connection, mint, buyer.publicKey);

    console.log(`📊 Initial balances:`);
    console.log(`   SOL: ${formatSOL(BigInt(initialSOLBalance))} SOL`);
    console.log(`   Tokens: ${formatNumber(initialTokenBalance / Math.pow(10, DEFAULT_DECIMALS))}`);
    console.log();

    // Get initial bonding curve state
    const initialCurve = await sdk.getBondingCurveAccount(mint);
    if (!initialCurve) {
        console.log("❌ Bonding curve not found!");
        return false;
    }

    console.log(`📈 Initial curve state:`);
    console.log(`   Virtual SOL Reserves: ${formatSOL(initialCurve.virtualSolReserves)} SOL`);
    console.log(`   Virtual Token Reserves: ${formatNumber(Number(initialCurve.virtualTokenReserves) / Math.pow(10, DEFAULT_DECIMALS))}`);
    console.log(`   Real Token Reserves: ${formatNumber(Number(initialCurve.realTokenReserves) / Math.pow(10, DEFAULT_DECIMALS))}`);
    console.log(`   Price per Token: ${initialCurve.getPricePerToken().toFixed(10)} SOL`);
    console.log();

    let allTestsPassed = true;
    let totalTestResults = [];

    for (let i = 0; i < testAmounts.length; i++) {
        const solAmount = testAmounts[i];
        console.log(`🔬 TEST ${i + 1}/${testAmounts.length}: Buying with ${solAmount} SOL`);
        console.log("-".repeat(60));

        try {
            // Step 1: Get quote from SDK
            const quote = await sdk.getBuyQuote(
                mint,
                BigInt(Math.floor(solAmount * LAMPORTS_PER_SOL)),
                BigInt(500) // 5% slippage
            );

            console.log(`📋 SDK Quote:`);
            console.log(`   SOL to spend: ${solAmount} SOL`);
            console.log(`   Tokens to receive: ${formatNumber(Number(quote.tokenAmount) / Math.pow(10, DEFAULT_DECIMALS))}`);
            console.log(`   Max SOL with slippage: ${Number(quote.solAmountWithSlippage) / LAMPORTS_PER_SOL} SOL`);
            console.log(`   Price impact: ${quote.priceImpact.toFixed(3)}%`);

            // Step 2: Execute the buy transaction
            console.log(`⚡ Executing buy transaction...`);

            const buyResult = await sdk.buy(
                buyer,
                mint,
                BigInt(Math.floor(solAmount * LAMPORTS_PER_SOL)),
                BigInt(500), // 5% slippage
                {
                    unitLimit: 400000,
                    unitPrice: 100000,
                }
            );

            if (buyResult.success) {
                console.log(`✅ Transaction successful!`);
                console.log(`   Signature: ${buyResult.signature}`);

                // Wait for transaction to settle
                await sleep(2000);

                // Step 3: Check actual results
                const newSOLBalance = await provider.connection.getBalance(buyer.publicKey);
                const newTokenBalance = await getTokenBalance(provider.connection, mint, buyer.publicKey);

                const actualSOLSpent = initialSOLBalance - newSOLBalance;
                const actualTokensReceived = newTokenBalance - initialTokenBalance;

                console.log(`📊 Actual results:`);
                console.log(`   SOL spent: ${formatSOL(BigInt(actualSOLSpent))} SOL`);
                console.log(`   Tokens received: ${formatNumber(actualTokensReceived / Math.pow(10, DEFAULT_DECIMALS))}`);

                // Step 4: Compare quote vs actual
                const quotedTokens = Number(quote.tokenAmount);
                const quotedSOL = Number(quote.solAmountWithSlippage);

                const tokenDifference = actualTokensReceived - quotedTokens;
                const solDifference = actualSOLSpent - quotedSOL;

                console.log(`🔍 Quote vs Actual:`);
                console.log(`   Token difference: ${formatNumber(tokenDifference / Math.pow(10, DEFAULT_DECIMALS))} (${((tokenDifference / quotedTokens) * 100).toFixed(3)}%)`);
                console.log(`   SOL difference: ${formatSOL(BigInt(Math.abs(solDifference)))} SOL (${((Math.abs(solDifference) / quotedSOL) * 100).toFixed(3)}%)`);

                // Step 5: Verify accuracy
                const tokenAccuracy = Math.abs(tokenDifference / quotedTokens) * 100;
                const solAccuracy = Math.abs(solDifference / quotedSOL) * 100;

                const testPassed = tokenAccuracy < 1.0 && solAccuracy < 5.0; // Allow 1% token variance, 5% SOL variance (fees, etc.)

                if (testPassed) {
                    console.log(`✅ Test PASSED - Quote accuracy within acceptable range`);
                } else {
                    console.log(`❌ Test FAILED - Quote accuracy outside acceptable range`);
                    allTestsPassed = false;
                }

                totalTestResults.push({
                    testNumber: i + 1,
                    solAmount,
                    quotedTokens,
                    actualTokensReceived,
                    quotedSOL,
                    actualSOLSpent,
                    tokenAccuracy,
                    solAccuracy,
                    passed: testPassed,
                    signature: buyResult.signature
                });

                // Update balances for next iteration
                let currentSOLBalance = newSOLBalance;
                let currentTokenBalance = newTokenBalance;

            } else {
                console.log(`❌ Transaction failed: ${buyResult.error}`);
                allTestsPassed = false;

                totalTestResults.push({
                    testNumber: i + 1,
                    solAmount,
                    error: buyResult.error,
                    passed: false
                });
            }

        } catch (error) {
            console.log(`❌ Test failed with error: ${error.message}`);
            allTestsPassed = false;

            totalTestResults.push({
                testNumber: i + 1,
                solAmount,
                error: error.message,
                passed: false
            });
        }

        console.log();

        // Small delay between tests
        if (i < testAmounts.length - 1) {
            console.log("⏳ Waiting 3 seconds before next test...");
            await sleep(3000);
        }
    }

    // Final summary
    console.log("📋 FINAL TEST SUMMARY");
    console.log("=".repeat(80));

    const passedTests = totalTestResults.filter(result => result.passed).length;
    const totalTests = totalTestResults.length;

    console.log(`Overall Result: ${passedTests}/${totalTests} tests passed`);

    if (allTestsPassed) {
        console.log("🎉 ALL TESTS PASSED! SDK quotes are accurate.");
    } else {
        console.log("⚠️  Some tests failed. Review the results above.");
    }

    console.log();
    console.log("📊 Detailed Results:");
    totalTestResults.forEach(result => {
        if (result.error) {
            console.log(`   Test ${result.testNumber}: ❌ ERROR - ${result.error}`);
        } else {
            console.log(`   Test ${result.testNumber}: ${result.passed ? '✅' : '❌'} ${result.solAmount} SOL - Token Accuracy: ${result.tokenAccuracy?.toFixed(2)}%, SOL Accuracy: ${result.solAccuracy?.toFixed(2)}%`);
        }
    });

    return allTestsPassed;
}

/**
 * Main test function
 */
async function main() {
    console.log("=".repeat(80));
    console.log("🧪 Yoink SDK Buy Execution Test - Quote vs Reality");
    console.log("=".repeat(80));
    console.log();

    try {
        // Initialize SDK with same config as smart contract tests
        console.log("🔧 INITIALIZATION:");
        console.log(`🌐 RPC URL: ${ECLIPSE_RPC_URL}`);

        const provider = await getProvider();
        const sdk = new YoinkSDK(provider);

        // Check wallet balance
        const balance = await provider.connection.getBalance(provider.wallet.publicKey);
        console.log(`💰 Wallet Balance: ${formatSOL(BigInt(balance))} SOL`);

        if (balance < 0.1 * LAMPORTS_PER_SOL) {
            console.log("⚠️  Warning: Wallet balance is low. Make sure you have enough SOL for testing.");
        }
        console.log();

        // Test tokens
        const testMints = [
            'HdpVsv7GSidT9N89E6KLMfw13uZ8i3jqdoJvyXfQ5z9t',
            '5UeBYiWx4GFo8dSFpZRvHUnXvEHv1bkuGS8dPFc7Tze7'
        ];

        // Test amounts (in SOL) - start small and increase
        const testAmounts = [0.001, 0.005, 0.01, 0.02]; // Very small amounts for testing

        let allTokensTestsPassed = true;

        for (let tokenIndex = 0; tokenIndex < testMints.length; tokenIndex++) {
            const mintAddress = testMints[tokenIndex];
            console.log(`\n🎯 TOKEN ${tokenIndex + 1}/${testMints.length}: ${mintAddress}`);
            console.log("=".repeat(80));

            try {
                const mint = new PublicKey(mintAddress);

                // Test this token
                const tokenTestsPassed = await testBuyExecution(sdk, mint, testAmounts);

                if (!tokenTestsPassed) {
                    allTokensTestsPassed = false;
                }

            } catch (error) {
                console.log(`❌ Error testing token: ${error.message}`);
                allTokensTestsPassed = false;
            }

            if (tokenIndex < testMints.length - 1) {
                console.log("\n⏳ Waiting 5 seconds before testing next token...");
                await sleep(5000);
            }
        }

        console.log("\n" + "=".repeat(80));
        console.log("🏁 OVERALL TEST RESULTS");
        console.log("=".repeat(80));

        if (allTokensTestsPassed) {
            console.log("🎉 SUCCESS: All buy execution tests passed!");
            console.log("✅ SDK quotes accurately predict actual transaction results");
            console.log("✅ Contract is accepting transactions as expected");
            console.log("✅ Price calculations are working correctly");
        } else {
            console.log("⚠️  MIXED RESULTS: Some tests failed");
            console.log("❌ Review the detailed results above");
            console.log("💡 This could indicate issues with:");
            console.log("   • Quote calculation accuracy");
            console.log("   • Slippage settings");
            console.log("   • Network conditions");
            console.log("   • Contract state changes");
        }

        console.log();
        console.log("📝 Test completed with real transactions on Eclipse network");
        console.log("🔗 Check transaction signatures on Eclipse explorer if needed");

    } catch (error) {
        console.error("❌ Test suite failed:", error);

        if (error.message.includes("ENOENT")) {
            console.log();
            console.log("💡 Setup Issues:");
            console.log("   • Make sure Solana CLI is configured");
            console.log("   • Run: solana config get");
            console.log("   • Ensure keypair file exists and is readable");
        }

        if (error.message.includes("Connection")) {
            console.log();
            console.log("💡 Connection Issues:");
            console.log("   • Check if Eclipse RPC is accessible");
            console.log("   • Try: curl -X POST " + ECLIPSE_RPC_URL);
        }
    }
}

// Run the test
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    testBuyExecution,
    ECLIPSE_RPC_URL
};