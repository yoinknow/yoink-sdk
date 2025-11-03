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

        // Debug raw values
        console.log("� RAW VALUES DEBUG:");
        console.log(`   Virtual SOL Reserves (raw): ${bondingCurve.virtualSolReserves.toString()}`);
        console.log(`   Virtual Token Reserves (raw): ${bondingCurve.virtualTokenReserves.toString()}`);
        console.log(`   Price per Token (raw calculation): ${pricePerToken}`);
        console.log(`   Price per Token (scientific): ${pricePerToken.toExponential()}`);
        console.log();

        console.log("�💰 PRICE INFORMATION:");
        console.log(`   Price per Token: ${pricePerToken.toFixed(10)} SOL`);
        console.log(`   Price per Token: $${(pricePerToken * 200).toFixed(8)} (assuming 1 SOL = $200)`);
        console.log();

        console.log("📈 MARKET DATA:");
        console.log(`   Market Cap: ${formatSOL(marketCapSOL)} SOL`);
        console.log(`   Market Cap: $${formatNumber(Number(marketCapSOL) / LAMPORTS_PER_SOL * 200, 2)} (assuming 1 SOL = $200)`);
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
 * Test price impact simulation
 */
async function testPriceImpact(sdk, mint) {
    console.log("🎯 PRICE IMPACT SIMULATION:");
    console.log("-".repeat(60));

    const tradeSizes = [0.01, 0.1, 0.5, 1.0]; // SOL amounts

    for (const solAmount of tradeSizes) {
        try {
            const buyQuote = await sdk.getBuyQuote(
                mint,
                BigInt(Math.floor(solAmount * LAMPORTS_PER_SOL)),
                BigInt(500) // 5% slippage
            );

            console.log(`💸 Buy ${solAmount} SOL worth:`);
            console.log(`   Tokens received: ${formatNumber(Number(buyQuote.tokenAmount) / Math.pow(10, DEFAULT_DECIMALS))}`);
            console.log(`   Effective price: ${(Number(buyQuote.solAmount) / Number(buyQuote.tokenAmount)).toFixed(10)} SOL per token`);
            console.log(`   Price impact: ${buyQuote.priceImpact >= 0 ? '+' : ''}${buyQuote.priceImpact.toFixed(3)}%`);
            console.log();
        } catch (error) {
            console.log(`   ❌ Error simulating ${solAmount} SOL trade: ${error.message}`);
        }
    }
}

/**
 * Main test function
 */
async function main() {
    console.log("=".repeat(80));
    console.log("🧪 Yoink SDK Price Test - Using Smart Contract Configuration");
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
        console.log();

        // Test tokens as requested
        const testMints = [
            'HdpVsv7GSidT9N89E6KLMfw13uZ8i3jqdoJvyXfQ5z9t',
            '5UeBYiWx4GFo8dSFpZRvHUnXvEHv1bkuGS8dPFc7Tze7'
        ];

        console.log("🎯 TESTING TARGET TOKENS:");
        console.log("=".repeat(80));

        for (let i = 0; i < testMints.length; i++) {
            const mintAddress = testMints[i];
            console.log(`\n📍 TOKEN ${i + 1}/2:`);

            try {
                const mint = new PublicKey(mintAddress);

                // Get price data
                const priceData = await getTokenPrice(sdk, mint);

                if (priceData) {
                    // Test price impact simulation
                    await testPriceImpact(sdk, mint);
                } else {
                    console.log("⚠️  Skipping price impact test - token not found");
                }

            } catch (error) {
                if (error.message.includes("Invalid public key")) {
                    console.log(`❌ Invalid mint address: ${mintAddress}`);
                } else {
                    console.log(`❌ Error processing token: ${error.message}`);
                }
            }

            if (i < testMints.length - 1) {
                console.log("\n" + "=".repeat(80));
            }
        }

        console.log("\n" + "=".repeat(80));
        console.log("✅ TEST COMPLETED SUCCESSFULLY!");
        console.log("=".repeat(80));
        console.log();
        console.log("📋 SUMMARY:");
        console.log("   • Used same RPC as smart contract tests");
        console.log("   • Used same keypair as smart contract tests");
        console.log("   • Tested both requested token mints");
        console.log("   • Analyzed price impact for different trade sizes");
        console.log();

    } catch (error) {
        console.error("❌ Test failed:", error);

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
    getTokenPrice,
    testPriceImpact,
    keypairFromSolanaConfig,
    ECLIPSE_RPC_URL
};