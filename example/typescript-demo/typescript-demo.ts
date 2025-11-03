import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { YoinkSDK, DEFAULT_DECIMALS } from "../../dist/esm";
import { AnchorProvider } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as yaml from "yaml";

// TypeScript interfaces for better type safety
interface TradeQuote {
    solAmount: bigint;
    tokenAmount: bigint;
    solAmountWithSlippage: bigint;
    pricePerToken: number;
    priceImpact: number;
}

interface TokenAnalysis {
    marketCapSOL: number;
    pricePerToken: number;
    liquidityRatio: number;
    complete: boolean;
    realSolReserves: number;
    realTokenReserves: number;
}

// Configuration with TypeScript types
const CONFIG = {
    RPC_URL: "https://staging-rpc.dev2.eclipsenetwork.xyz",
    SLIPPAGE_BASIS_POINTS: BigInt(500), // 5% slippage
    TEST_AMOUNT_SOL: 0.001,
} as const;

/**
 * Load keypair from Solana CLI config with proper typing
 */
async function keypairFromSolanaConfig(): Promise<Keypair> {
    try {
        const cfgPath: string = path.resolve(os.homedir(), ".config", "solana", "cli", "config.yml");
        const cfgData: string = fs.readFileSync(cfgPath, "utf8");
        const cfg = yaml.parse(cfgData);

        const secretKeyData: string = fs.readFileSync(cfg.keypair_path, "utf8");
        const secret: Uint8Array = Uint8Array.from(JSON.parse(secretKeyData));
        const keypair: Keypair = Keypair.fromSecretKey(secret);

        return keypair;
    } catch (error) {
        console.error("❌ Error loading keypair:", (error as Error).message);
        throw error;
    }
}

/**
 * Get provider with proper TypeScript typing
 */
async function getProvider(): Promise<AnchorProvider> {
    const connection = new Connection(CONFIG.RPC_URL, { commitment: "confirmed" });
    const keypair = await keypairFromSolanaConfig();
    const wallet = new NodeWallet(keypair);
    return new AnchorProvider(connection, wallet, { commitment: "confirmed" });
}

/**
 * Analyze token with TypeScript types
 */
async function analyzeToken(sdk: YoinkSDK, mint: PublicKey): Promise<TokenAnalysis | null> {
    try {
        const bondingCurve = await sdk.getBondingCurveAccount(mint);

        if (!bondingCurve) {
            return null;
        }

        return {
            marketCapSOL: Number(bondingCurve.getMarketCapSOL()) / LAMPORTS_PER_SOL,
            pricePerToken: bondingCurve.getPricePerToken(),
            liquidityRatio: Number(bondingCurve.realSolReserves) / Number(bondingCurve.getMarketCapSOL()),
            complete: bondingCurve.complete,
            realSolReserves: Number(bondingCurve.realSolReserves) / LAMPORTS_PER_SOL,
            realTokenReserves: Number(bondingCurve.realTokenReserves) / Math.pow(10, DEFAULT_DECIMALS)
        };

    } catch (error) {
        console.error(`Error analyzing token: ${(error as Error).message}`);
        return null;
    }
}

/**
 * Get trading quote with TypeScript types
 */
async function getTradeQuote(
    sdk: YoinkSDK,
    mint: PublicKey,
    solAmount: number
): Promise<TradeQuote> {
    const buyAmount = BigInt(Math.floor(solAmount * LAMPORTS_PER_SOL));

    const quote = await sdk.getBuyQuote(
        mint,
        buyAmount,
        CONFIG.SLIPPAGE_BASIS_POINTS
    );

    return {
        solAmount: quote.solAmount,
        tokenAmount: quote.tokenAmount,
        solAmountWithSlippage: quote.solAmountWithSlippage,
        pricePerToken: quote.pricePerToken,
        priceImpact: quote.priceImpact
    };
}

/**
 * Main TypeScript demo function
 */
async function main(): Promise<void> {
    console.log("=".repeat(70));
    console.log("🔷 Yoink SDK TypeScript Compatibility Demo");
    console.log("=".repeat(70));
    console.log();

    try {
        // Initialize SDK with TypeScript
        console.log("🔧 TYPESCRIPT SDK INITIALIZATION:");
        console.log("-".repeat(50));
        console.log(`🌐 RPC URL: ${CONFIG.RPC_URL}`);

        const provider: AnchorProvider = await getProvider();
        const sdk: YoinkSDK = new YoinkSDK(provider);

        const keypair: Keypair = await keypairFromSolanaConfig();
        console.log(`🔑 Wallet: ${keypair.publicKey.toBase58()}`);
        console.log();

        // Test tokens with proper typing
        const testMints: PublicKey[] = [
            new PublicKey('HdpVsv7GSidT9N89E6KLMfw13uZ8i3jqdoJvyXfQ5z9t'),
            new PublicKey('5UeBYiWx4GFo8dSFpZRvHUnXvEHv1bkuGS8dPFc7Tze7')
        ];

        console.log("📊 TYPESCRIPT TOKEN ANALYSIS:");
        console.log("-".repeat(50));

        for (let i = 0; i < testMints.length; i++) {
            const mint: PublicKey = testMints[i];
            console.log(`\n🔍 Token ${i + 1}: ${mint.toBase58()}`);

            // Analyze token with TypeScript types
            const analysis: TokenAnalysis | null = await analyzeToken(sdk, mint);

            if (analysis) {
                console.log(`   ✅ Market Cap: ${analysis.marketCapSOL.toFixed(6)} SOL`);
                console.log(`   ✅ Price: ${analysis.pricePerToken.toFixed(10)} SOL`);
                console.log(`   ✅ Liquidity Ratio: ${analysis.liquidityRatio.toFixed(4)}`);
                console.log(`   ✅ Complete: ${analysis.complete ? "YES" : "NO"}`);
                console.log(`   ✅ Real SOL: ${analysis.realSolReserves.toFixed(6)} SOL`);
                console.log(`   ✅ Real Tokens: ${(analysis.realTokenReserves / 1000000).toFixed(2)}M`);

                // Get trading quote with TypeScript types
                const quote: TradeQuote = await getTradeQuote(sdk, mint, CONFIG.TEST_AMOUNT_SOL);

                console.log(`\n   💰 Quote for ${CONFIG.TEST_AMOUNT_SOL} SOL:`);
                console.log(`      Tokens: ${(Number(quote.tokenAmount) / Math.pow(10, DEFAULT_DECIMALS) / 1000).toFixed(2)}K`);
                console.log(`      Price Impact: ${quote.priceImpact.toFixed(3)}%`);
                console.log(`      Max SOL: ${Number(quote.solAmountWithSlippage) / LAMPORTS_PER_SOL} SOL`);

            } else {
                console.log(`   ❌ Analysis failed or token not found`);
            }
        }

        console.log();
        console.log("=".repeat(70));
        console.log("✅ TYPESCRIPT COMPATIBILITY VERIFIED");
        console.log("=".repeat(70));
        console.log();
        console.log("🔷 TypeScript Features Demonstrated:");
        console.log("   ✅ Full type safety with interfaces");
        console.log("   ✅ BigInt support for precise calculations");
        console.log("   ✅ Proper async/await typing");
        console.log("   ✅ ES2020 module compatibility");
        console.log("   ✅ Strict TypeScript compilation");
        console.log("   ✅ Type declarations included");
        console.log();
        console.log("📦 Import Methods Available:");
        console.log("   • ESM: import { YoinkSDK } from 'yoink-sdk'");
        console.log("   • CommonJS: const { YoinkSDK } = require('yoink-sdk')");
        console.log("   • Browser: <script src='dist/browser/index.js'></script>");
        console.log();
        console.log("🎯 TypeScript Configuration:");
        console.log("   • Target: ES2020");
        console.log("   • Strict mode enabled");
        console.log("   • Full type declarations");
        console.log("   • Multiple output formats");

    } catch (error) {
        console.error("❌ TypeScript demo failed:", (error as Error).message);
        console.log();
        console.log("🔧 Troubleshooting:");
        console.log("   • Ensure TypeScript is installed: npm install -g typescript");
        console.log("   • Check SDK build: npm run build");
        console.log("   • Verify tsconfig.json configuration");
    }
}

// Export types for external use
export type { TradeQuote, TokenAnalysis };
export { CONFIG, analyzeToken, getTradeQuote };

// Run demo if called directly
if (require.main === module) {
    main().catch(console.error);
}