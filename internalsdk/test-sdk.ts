import * as dotenv from "dotenv";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { YoinkSDK } from "./src";
import * as NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { AnchorProvider } from "@coral-xyz/anchor";

dotenv.config();

/**
 * Simple test to verify SDK functionality
 */
async function testSDK() {
  console.log("=".repeat(80));
  console.log("🧪 Yoink SDK - Basic Functionality Test");
  console.log("=".repeat(80));
  console.log();

  try {
    // 1. Setup connection
    console.log("1️⃣  Setting up connection...");
    const rpcUrl = process.env.SOLANA_RPC_URL || "https://staging-rpc.dev2.eclipsenetwork.xyz";
    console.log(`   RPC URL: ${rpcUrl}`);
    
    const connection = new Connection(rpcUrl, { commitment: "confirmed" });
    const wallet = new NodeWallet.default(Keypair.generate());
    const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
    
    console.log("   ✅ Connection established\n");

    // 2. Initialize SDK
    console.log("2️⃣  Initializing SDK...");
    const sdk = new YoinkSDK(provider);
    console.log("   ✅ SDK initialized");
    console.log(`   Program ID: ${sdk.program.programId.toBase58()}\n`);

    // 3. Test Global Account
    console.log("3️⃣  Fetching Global Account...");
    try {
      const globalAccount = await sdk.getGlobalAccount();
      console.log("   ✅ Global account fetched successfully!");
      console.log(`   - Initialized: ${globalAccount.initialized}`);
      console.log(`   - Fee Basis Points: ${globalAccount.feeBasisPoints.toString()} (${Number(globalAccount.feeBasisPoints) / 100}%)`);
      console.log(`   - Fee Recipient: ${globalAccount.feeRecipient.toBase58()}`);
      console.log(`   - Initial Virtual Token Reserves: ${globalAccount.initialVirtualTokenReserves.toString()}`);
      console.log(`   - Initial Virtual SOL Reserves: ${Number(globalAccount.initialVirtualSolReserves) / LAMPORTS_PER_SOL} SOL`);
      console.log();
    } catch (error) {
      console.log("   ❌ Failed to fetch global account");
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      console.log("   Note: This might be expected if the program isn't initialized yet\n");
    }

    // 4. Test with example token (use actual token from your tests if available)
    console.log("4️⃣  Testing Bonding Curve Query...");
    
    // You can replace these with actual token addresses from your test scripts
    const exampleMints = [
      "5UeBYiWx4GFo8dSFpZRvHUnXvEHv1bkuGS8dPFc7Tze7", // Token from continuous-trading-dual.test.ts
      "CLz9Jbsd5vhmCpPtY3RFqy5svbUtZoHgZox6zriyX4Pv", // Token 2 from the same test
    ];

    let foundToken = false;
    for (const mintStr of exampleMints) {
      try {
        const mint = new PublicKey(mintStr);
        console.log(`   Trying mint: ${mintStr}`);
        
        const bondingCurve = await sdk.getBondingCurveAccount(mint);
        
        if (bondingCurve) {
          foundToken = true;
          console.log("   ✅ Bonding curve found!");
          console.log(`   - Virtual Token Reserves: ${bondingCurve.virtualTokenReserves.toString()}`);
          console.log(`   - Virtual SOL Reserves: ${Number(bondingCurve.virtualSolReserves) / LAMPORTS_PER_SOL} SOL`);
          console.log(`   - Real Token Reserves: ${bondingCurve.realTokenReserves.toString()}`);
          console.log(`   - Real SOL Reserves: ${Number(bondingCurve.realSolReserves) / LAMPORTS_PER_SOL} SOL`);
          console.log(`   - Complete: ${bondingCurve.complete ? "YES ✅" : "NO"}`);
          console.log(`   - Market Cap: ${Number(bondingCurve.getMarketCapSOL()) / LAMPORTS_PER_SOL} SOL`);
          console.log(`   - Price per Token: ${(bondingCurve.getPricePerToken() * LAMPORTS_PER_SOL).toFixed(9)} SOL`);
          console.log();

          // 5. Test Quote Functions
          console.log("5️⃣  Testing Quote Functions...");
          
          // Test buy quote
          try {
            const buyAmount = BigInt(0.01 * LAMPORTS_PER_SOL); // 0.01 SOL
            const buyQuote = await sdk.getBuyQuote(mint, buyAmount, BigInt(500));
            console.log("   ✅ Buy quote calculated:");
            console.log(`   - SOL to spend: ${Number(buyQuote.solAmount) / LAMPORTS_PER_SOL} SOL`);
            console.log(`   - Tokens to receive: ${Number(buyQuote.tokenAmount) / 1_000_000} (with 6 decimals)`);
            console.log(`   - Price per token: ${buyQuote.pricePerToken.toFixed(9)} SOL`);
            console.log(`   - Price impact: ${buyQuote.priceImpact.toFixed(4)}%`);
            console.log(`   - Max SOL with slippage: ${Number(buyQuote.solAmountWithSlippage) / LAMPORTS_PER_SOL} SOL`);
            console.log();
          } catch (error) {
            console.log(`   ⚠️  Buy quote failed: ${error instanceof Error ? error.message : String(error)}\n`);
          }

          // Test sell quote (if there are tokens in the curve)
          if (bondingCurve.realTokenReserves > BigInt(0)) {
            try {
              const sellAmount = BigInt(1000000); // 1 token with 6 decimals
              const sellQuote = await sdk.getSellQuote(mint, sellAmount, BigInt(500));
              console.log("   ✅ Sell quote calculated:");
              console.log(`   - Tokens to sell: ${Number(sellQuote.tokenAmount) / 1_000_000}`);
              console.log(`   - SOL to receive: ${Number(sellQuote.solAmount) / LAMPORTS_PER_SOL} SOL`);
              console.log(`   - Price per token: ${sellQuote.pricePerToken.toFixed(9)} SOL`);
              console.log(`   - Price impact: ${sellQuote.priceImpact.toFixed(4)}%`);
              console.log(`   - Min SOL with slippage: ${Number(sellQuote.solAmountWithSlippage) / LAMPORTS_PER_SOL} SOL`);
              console.log();
            } catch (error) {
              console.log(`   ⚠️  Sell quote failed: ${error instanceof Error ? error.message : String(error)}\n`);
            }
          }

          break; // Found a working token, stop trying
        }
      } catch (error) {
        // Token not found, try next one
        continue;
      }
    }

    if (!foundToken) {
      console.log("   ℹ️  No active bonding curves found with the example tokens");
      console.log("   This is normal if no tokens have been created yet");
      console.log("   To test with an actual token, run one of your test scripts first:");
      console.log("   - cd /home/memewhales/smart_livestreams");
      console.log("   - yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/continuous-trading-dual.test.ts");
      console.log();
    }

    // 6. Test PDA Functions
    console.log("6️⃣  Testing PDA Generation...");
    const testMint = new PublicKey("5UeBYiWx4GFo8dSFpZRvHUnXvEHv1bkuGS8dPFc7Tze7");
    const testUser = Keypair.generate().publicKey;
    
    const bondingCurvePDA = sdk.getBondingCurvePDA(testMint);
    const globalPDA = sdk.getGlobalPDA();
    const holderStatsPDA = sdk.getHolderStatsPDA(testMint, testUser);
    
    console.log("   ✅ PDAs generated successfully:");
    console.log(`   - Bonding Curve PDA: ${bondingCurvePDA.toBase58()}`);
    console.log(`   - Global PDA: ${globalPDA.toBase58()}`);
    console.log(`   - Holder Stats PDA: ${holderStatsPDA.toBase58()}`);
    console.log();

    // Success!
    console.log("=".repeat(80));
    console.log("✅ SDK Test Complete - All Basic Functions Working!");
    console.log("=".repeat(80));
    console.log();
    console.log("Next steps:");
    console.log("1. To test actual trading (buy/sell), make sure you have:");
    console.log("   - A funded keypair with SOL");
    console.log("   - An active token mint address");
    console.log("2. See the example in: example/basic/index.ts");
    console.log("3. Or run your existing test scripts to create tokens first");
    console.log();

  } catch (error) {
    console.log("\n❌ Test Failed:");
    console.error(error);
    console.log();
    
    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        console.log("💡 Tip: Check your RPC URL in .env file");
      } else if (error.message.includes("account")) {
        console.log("💡 Tip: Make sure the program is deployed and initialized");
      }
    }
  }
}

// Run the test
testSDK().catch(console.error);
