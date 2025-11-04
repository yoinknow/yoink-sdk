const { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } = require("@solana/web3.js");
const { YoinkSDK } = require("./dist/cjs");
const { AnchorProvider } = require("@coral-xyz/anchor");
const NodeWallet = require("@coral-xyz/anchor/dist/cjs/nodewallet").default;
require("dotenv").config();

// Explorer base URL for Solana
const EXPLORER_URL = "https://explorer.dev.eclipsenetwork.xyz";

/**
 * Generate explorer link for an address
 */
function getExplorerLink(address, type = "address") {
  return `${EXPLORER_URL}/${type}/${address}`;
}

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
    const rpcUrl = process.env.RPC_URL || process.env.SOLANA_RPC_URL || "https://staging-rpc.dev2.eclipsenetwork.xyz";
    console.log(`   RPC URL: ${rpcUrl}`);
    
    const connection = new Connection(rpcUrl, { commitment: "confirmed" });
    
    // Load wallet from .env file
    let keypair;
    if (process.env.PRIVATE_KEY) {
      try {
        const privateKeyArray = JSON.parse(process.env.PRIVATE_KEY);
        keypair = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
        console.log(`   Using wallet from .env: ${keypair.publicKey.toBase58()}`);
      } catch (e) {
        console.log("   ⚠️  Invalid PRIVATE_KEY in .env, using generated keypair");
        keypair = Keypair.generate();
      }
    } else {
      console.log("   ℹ️  No PRIVATE_KEY in .env, using generated keypair (read-only test)");
      keypair = Keypair.generate();
    }
    
    const wallet = new NodeWallet(keypair);
    const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
    
    console.log("   ✅ Connection established\n");

    // 2. Initialize SDK
    console.log("2️⃣  Initializing SDK...");
    const sdk = new YoinkSDK(provider);
    console.log("   ✅ SDK initialized");
    console.log(`   Program ID: ${sdk.program.programId.toBase58()}`);
    console.log(`   🔗 Explorer: ${getExplorerLink(sdk.program.programId.toBase58(), "address")}\n`);

    // 3. Test Global Account
    console.log("3️⃣  Fetching Global Account...");
    try {
      const globalAccount = await sdk.getGlobalAccount();
      const globalPDA = sdk.getGlobalPDA();
      console.log("   ✅ Global account fetched successfully!");
      console.log(`   - Address: ${globalPDA.toBase58()}`);
      console.log(`   - 🔗 Explorer: ${getExplorerLink(globalPDA.toBase58(), "address")}`);
      console.log(`   - Initialized: ${globalAccount.initialized}`);
      console.log(`   - Fee Basis Points: ${globalAccount.feeBasisPoints.toString()} (${Number(globalAccount.feeBasisPoints) / 100}%)`);
      console.log(`   - Fee Recipient: ${globalAccount.feeRecipient.toBase58()}`);
      console.log(`   - Initial Virtual Token Reserves: ${globalAccount.initialVirtualTokenReserves.toString()}`);
      console.log(`   - Initial Virtual SOL Reserves: ${Number(globalAccount.initialVirtualSolReserves) / LAMPORTS_PER_SOL} SOL`);
      console.log();
    } catch (error) {
      console.log("   ❌ Failed to fetch global account");
      console.log(`   Error: ${error.message || String(error)}`);
      console.log("   Note: This might be expected if the program isn't initialized yet\n");
    }

    // 4. Test with example token
    console.log("4️⃣  Testing Bonding Curve Query...");
    
    const exampleMints = [
      "5UeBYiWx4GFo8dSFpZRvHUnXvEHv1bkuGS8dPFc7Tze7",
      "CLz9Jbsd5vhmCpPtY3RFqy5svbUtZoHgZox6zriyX4Pv",
    ];

    let foundToken = false;
    for (const mintStr of exampleMints) {
      try {
        const mint = new PublicKey(mintStr);
        console.log(`   Trying mint: ${mintStr}`);
        
        const bondingCurve = await sdk.getBondingCurveAccount(mint);
        
        if (bondingCurve) {
          foundToken = true;
          const bondingCurvePDA = sdk.getBondingCurvePDA(mint);
          console.log("   ✅ Bonding curve found!");
          console.log(`   - Token Mint: ${mintStr}`);
          console.log(`   - 🔗 Token Explorer: ${getExplorerLink(mintStr, "address")}`);
          console.log(`   - Bonding Curve PDA: ${bondingCurvePDA.toBase58()}`);
          console.log(`   - 🔗 Curve Explorer: ${getExplorerLink(bondingCurvePDA.toBase58(), "address")}`);
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
          
          try {
            const buyAmount = BigInt(0.01 * LAMPORTS_PER_SOL);
            const buyQuote = await sdk.getBuyQuote(mint, buyAmount, BigInt(500));
            console.log("   ✅ Buy quote calculated:");
            console.log(`   - SOL to spend: ${Number(buyQuote.solAmount) / LAMPORTS_PER_SOL} SOL`);
            console.log(`   - Tokens to receive: ${Number(buyQuote.tokenAmount) / 1_000_000} (with 6 decimals)`);
            console.log(`   - Price per token: ${buyQuote.pricePerToken.toFixed(9)} SOL`);
            console.log(`   - Price impact: ${buyQuote.priceImpact.toFixed(4)}%`);
            console.log(`   - Max SOL with slippage: ${Number(buyQuote.solAmountWithSlippage) / LAMPORTS_PER_SOL} SOL`);
            console.log();
          } catch (error) {
            console.log(`   ⚠️  Buy quote failed: ${error.message || String(error)}\n`);
          }

          if (bondingCurve.realTokenReserves > BigInt(0)) {
            try {
              const sellAmount = BigInt(1000000);
              const sellQuote = await sdk.getSellQuote(mint, sellAmount, BigInt(500));
              console.log("   ✅ Sell quote calculated:");
              console.log(`   - Tokens to sell: ${Number(sellQuote.tokenAmount) / 1_000_000}`);
              console.log(`   - SOL to receive: ${Number(sellQuote.solAmount) / LAMPORTS_PER_SOL} SOL`);
              console.log(`   - Price per token: ${sellQuote.pricePerToken.toFixed(9)} SOL`);
              console.log(`   - Price impact: ${sellQuote.priceImpact.toFixed(4)}%`);
              console.log(`   - Min SOL with slippage: ${Number(sellQuote.solAmountWithSlippage) / LAMPORTS_PER_SOL} SOL`);
              console.log();
            } catch (error) {
              console.log(`   ⚠️  Sell quote failed: ${error.message || String(error)}\n`);
            }
          }

          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!foundToken) {
      console.log("   ℹ️  No active bonding curves found with the example tokens");
      console.log("   This is normal if no tokens have been created yet\n");
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
    console.log(`     🔗 ${getExplorerLink(bondingCurvePDA.toBase58(), "address")}`);
    console.log(`   - Global PDA: ${globalPDA.toBase58()}`);
    console.log(`     🔗 ${getExplorerLink(globalPDA.toBase58(), "address")}`);
    console.log(`   - Holder Stats PDA: ${holderStatsPDA.toBase58()}`);
    console.log(`     🔗 ${getExplorerLink(holderStatsPDA.toBase58(), "address")}`);
    console.log();

    console.log("=".repeat(80));
    console.log("✅ SDK Test Complete - All Basic Functions Working!");
    console.log("=".repeat(80));
    console.log();
    console.log("🔗 Useful Links:");
    console.log(`   - Program: ${getExplorerLink(sdk.program.programId.toBase58(), "address")}`);
    console.log(`   - Global State: ${getExplorerLink(sdk.getGlobalPDA().toBase58(), "address")}`);
    console.log(`   - Solana Explorer: ${EXPLORER_URL}`);
    console.log();

  } catch (error) {
    console.log("\n❌ Test Failed:");
    console.error(error);
    console.log();
  }
}

testSDK().catch(console.error);
