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
    const cfgPath = path.resolve(os.homedir(), ".config", "solana", "cli", "config.yml");
    const cfgData = fs.readFileSync(cfgPath, "utf8");
    const cfg = yaml.parse(cfgData);
    const secretKeyData = fs.readFileSync(cfg.keypair_path, "utf8");
    const secret = Uint8Array.from(JSON.parse(secretKeyData));
    return Keypair.fromSecretKey(secret);
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
 * Test contract formula vs SDK formula
 */
async function testFormulas() {
    console.log("🧮 FORMULA VERIFICATION TEST");
    console.log("=".repeat(80));

    const provider = await getProvider();
    const sdk = new YoinkSDK(provider);

    // Test with the first token
    const mint = new PublicKey('HdpVsv7GSidT9N89E6KLMfw13uZ8i3jqdoJvyXfQ5z9t');
    const bondingCurve = await sdk.getBondingCurveAccount(mint);

    if (!bondingCurve) {
        console.log("❌ Could not fetch bonding curve");
        return;
    }

    const virtualSolReserves = BigInt(bondingCurve.virtualSolReserves);
    const virtualTokenReserves = BigInt(bondingCurve.virtualTokenReserves);

    console.log("📊 BONDING CURVE STATE:");
    console.log(`   Virtual SOL Reserves: ${virtualSolReserves.toString()}`);
    console.log(`   Virtual Token Reserves: ${virtualTokenReserves.toString()}`);
    console.log();

    // Test different token amounts
    const testAmounts = [1000000, 10000000, 100000000]; // 1M, 10M, 100M tokens (6 decimals)

    console.log("🔬 TESTING CONTRACT FORMULA:");
    console.log("   contract: sol_cost = (token_amount * virtual_sol_reserves) / (virtual_token_reserves - token_amount)");
    console.log();

    for (const tokenAmount of testAmounts) {
        const tokenAmountBig = BigInt(tokenAmount);

        // Contract formula: buy_quote
        const solCost = (tokenAmountBig * virtualSolReserves) / (virtualTokenReserves - tokenAmountBig);
        const solCostWithRounding = solCost + BigInt(1); // contract adds +1 for rounding

        // Now reverse it to find: how many tokens for X SOL
        // From: sol_cost = (token_amount * virtual_sol_reserves) / (virtual_token_reserves - token_amount)
        // To: token_amount = (sol_cost * virtual_token_reserves) / (virtual_sol_reserves + sol_cost)
        const tokensFromReverse = (solCost * virtualTokenReserves) / (virtualSolReserves + solCost);

        // SDK's current approach (what we're using for quotes)
        const tokensFromSDK = bondingCurve.getBuyPrice(solCost);

        console.log(`📍 ${(tokenAmount / 1000000).toFixed(1)}M tokens:`);
        console.log(`   Contract sol_cost: ${Number(solCost) / LAMPORTS_PER_SOL} SOL`);
        console.log(`   Contract sol_cost (+1): ${Number(solCostWithRounding) / LAMPORTS_PER_SOL} SOL`);
        console.log(`   Reverse formula tokens: ${Number(tokensFromReverse) / 1000000} M`);
        console.log(`   SDK getBuyPrice tokens: ${Number(tokensFromSDK) / 1000000} M`);
        console.log(`   Difference: ${Number(tokensFromReverse - tokensFromSDK) / 1000000} M`);
        console.log();
    }

    // Now test the current price calculation
    console.log("💰 PRICE PER TOKEN CALCULATION:");
    const currentPrice = bondingCurve.getPricePerToken();

    // For 1 token, what would the contract charge?
    const oneToken = BigInt(1000000); // 1 token with 6 decimals
    const contractPriceFor1Token = (oneToken * virtualSolReserves) / (virtualTokenReserves - oneToken);
    const contractPriceFor1TokenSOL = Number(contractPriceFor1Token) / LAMPORTS_PER_SOL;

    console.log(`   SDK current price: ${currentPrice.toFixed(10)} SOL`);
    console.log(`   Contract price for 1 token: ${contractPriceFor1TokenSOL.toFixed(10)} SOL`);
    console.log(`   Difference: ${Math.abs(currentPrice - contractPriceFor1TokenSOL).toFixed(10)} SOL`);
    console.log();

    // Test with your expected price
    const expectedPrice = 0.0000002657;
    console.log(`   Your expected price: ${expectedPrice.toFixed(10)} SOL`);
    console.log(`   Difference from SDK: ${Math.abs(currentPrice - expectedPrice).toFixed(10)} SOL`);
    console.log(`   Difference from contract: ${Math.abs(contractPriceFor1TokenSOL - expectedPrice).toFixed(10)} SOL`);
}

testFormulas().catch(console.error);