const { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } = require("@solana/web3.js");
const { YoinkSDK } = require("./dist/cjs");
const { AnchorProvider } = require("@coral-xyz/anchor");
const NodeWallet = require("@coral-xyz/anchor/dist/cjs/nodewallet").default;
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Explorer base URL for Eclipse
const EXPLORER_URL = "https://explorer.dev.eclipsenetwork.xyz";

/**
 * Generate explorer link for an address or transaction
 */
function getExplorerLink(addressOrTx, type = "address") {
  return `${EXPLORER_URL}/${type}/${addressOrTx}`;
}

/**
 * Get or create a keypair from file
 */
function getOrCreateKeypair(folder, name) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  const keypairPath = path.join(folder, `${name}.json`);
  
  if (fs.existsSync(keypairPath)) {
    const secretKey = JSON.parse(fs.readFileSync(keypairPath, "utf8"));
    return Keypair.fromSecretKey(Uint8Array.from(secretKey));
  } else {
    const keypair = Keypair.generate();
    fs.writeFileSync(keypairPath, JSON.stringify(Array.from(keypair.secretKey)));
    return keypair;
  }
}

/**
 * Test SDK with actual buy/sell transactions
 */
async function testSDKWithTransactions() {
  console.log("=".repeat(80));
  console.log("🧪 Yoink SDK - Full Test with Buy/Sell Transactions");
  console.log("=".repeat(80));
  console.log();

  try {
    // 1. Setup connection
    console.log("1️⃣  Setting up connection...");
    const rpcUrl = process.env.RPC_URL || process.env.ECLIPSE_RPC_URL || "https://staging-rpc.dev2.eclipsenetwork.xyz";
    console.log(`   RPC URL: ${rpcUrl}`);
    
    const connection = new Connection(rpcUrl, { commitment: "confirmed" });
    
    // Load test account keypair
    let testAccount;
    
    // First try to load from .env file
    if (process.env.PRIVATE_KEY) {
      try {
        const privateKeyArray = JSON.parse(process.env.PRIVATE_KEY);
        testAccount = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
        console.log("   ✅ Using wallet from .env file");
      } catch (e) {
        console.log("   ⚠️  Invalid PRIVATE_KEY in .env");
        // Fall back to file-based keypair
        const KEYS_FOLDER = __dirname + "/.keys";
        testAccount = getOrCreateKeypair(KEYS_FOLDER, "test-account");
        console.log("   Using wallet from .keys/test-account.json");
      }
    } else {
      // Fall back to file-based keypair
      const KEYS_FOLDER = __dirname + "/.keys";
      testAccount = getOrCreateKeypair(KEYS_FOLDER, "test-account");
      console.log("   ℹ️  No PRIVATE_KEY in .env, using .keys/test-account.json");
    }
    
    const wallet = new NodeWallet(testAccount);
    const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
    
    console.log("   ✅ Connection established");
    console.log(`   Test Account: ${testAccount.publicKey.toBase58()}`);
    console.log(`   🔗 ${getExplorerLink(testAccount.publicKey.toBase58(), "address")}`);
    
    // Check balance
    const balance = await connection.getBalance(testAccount.publicKey);
    console.log(`   Balance: ${(balance / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
    
    if (balance === 0) {
      console.log("\n   ⚠️  WARNING: Test account has no SOL!");
      console.log("   Please fund this account to test buy/sell transactions:");
      console.log(`   Address: ${testAccount.publicKey.toBase58()}`);
      console.log("   You can continue with read-only tests...\n");
    }
    console.log();

    // 2. Initialize SDK
    console.log("2️⃣  Initializing SDK...");
    const sdk = new YoinkSDK(provider);
    console.log("   ✅ SDK initialized");
    console.log(`   Program ID: ${sdk.program.programId.toBase58()}`);
    console.log(`   🔗 Explorer: ${getExplorerLink(sdk.program.programId.toBase58(), "address")}\n`);

    // 3. Test Global Account
    console.log("3️⃣  Fetching Global Account...");
    const globalAccount = await sdk.getGlobalAccount();
    const globalPDA = sdk.getGlobalPDA();
    console.log("   ✅ Global account fetched successfully!");
    console.log(`   - Address: ${globalPDA.toBase58()}`);
    console.log(`   - 🔗 Explorer: ${getExplorerLink(globalPDA.toBase58(), "address")}`);
    console.log(`   - Fee: ${Number(globalAccount.feeBasisPoints) / 100}%`);
    console.log();

    // 4. Find a token to trade
    console.log("4️⃣  Finding Token to Trade...");
    
    const exampleMints = [
      "5UeBYiWx4GFo8dSFpZRvHUnXvEHv1bkuGS8dPFc7Tze7",
      "CLz9Jbsd5vhmCpPtY3RFqy5svbUtZoHgZox6zriyX4Pv",
    ];

    let tradingToken = null;
    let bondingCurve = null;

    for (const mintStr of exampleMints) {
      try {
        const mint = new PublicKey(mintStr);
        const curve = await sdk.getBondingCurveAccount(mint);
        
        if (curve && !curve.complete && curve.realTokenReserves > BigInt(0)) {
          tradingToken = mint;
          bondingCurve = curve;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!tradingToken) {
      console.log("   ⚠️  No active tokens found for trading");
      console.log("   Skipping buy/sell transaction tests\n");
      return;
    }

    const bondingCurvePDA = sdk.getBondingCurvePDA(tradingToken);
    console.log("   ✅ Found active token!");
    console.log(`   - Token Mint: ${tradingToken.toBase58()}`);
    console.log(`   - 🔗 Token Explorer: ${getExplorerLink(tradingToken.toBase58(), "address")}`);
    console.log(`   - Bonding Curve: ${bondingCurvePDA.toBase58()}`);
    console.log(`   - 🔗 Curve Explorer: ${getExplorerLink(bondingCurvePDA.toBase58(), "address")}`);
    console.log(`   - Market Cap: ${Number(bondingCurve.getMarketCapSOL()) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   - Price: ${(bondingCurve.getPricePerToken() * LAMPORTS_PER_SOL).toFixed(9)} SOL/token`);
    console.log();

    // 5. Get Buy Quote
    console.log("5️⃣  Getting Buy Quote...");
    const buyAmount = BigInt(0.001 * LAMPORTS_PER_SOL); // 0.001 SOL for testing
    const buyQuote = await sdk.getBuyQuote(tradingToken, buyAmount, BigInt(500));
    console.log("   ✅ Buy quote calculated:");
    console.log(`   - SOL to spend: ${Number(buyQuote.solAmount) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   - Tokens to receive: ${Number(buyQuote.tokenAmount) / 1_000_000}`);
    console.log(`   - Price impact: ${buyQuote.priceImpact.toFixed(4)}%`);
    console.log();

    // 6. Execute Buy (if funded)
    if (balance >= buyAmount) {
      console.log("6️⃣  Executing BUY Transaction...");
      console.log(`   Buying ${Number(buyQuote.tokenAmount) / 1_000_000} tokens for ${Number(buyAmount) / LAMPORTS_PER_SOL} SOL...`);
      
      try {
        const buyResult = await sdk.buy(
          testAccount,
          tradingToken,
          buyAmount,
          BigInt(500), // 5% slippage
          {
            unitLimit: 400000,
            unitPrice: 100000,
          }
        );

        if (buyResult.success) {
          console.log("   ✅ BUY SUCCESSFUL!");
          console.log(`   - Transaction Signature: ${buyResult.signature}`);
          console.log(`   - 🔗 Transaction Explorer: ${getExplorerLink(buyResult.signature, "tx")}`);
          console.log(`   - Block: ${buyResult.results?.slot || "pending"}`);
          console.log();

          // Wait a bit for confirmation
          await new Promise(resolve => setTimeout(resolve, 2000));

          // 7. Get token balance
          console.log("7️⃣  Checking Token Balance...");
          const { getAccount, getAssociatedTokenAddress } = require("@solana/spl-token");
          const ata = await getAssociatedTokenAddress(tradingToken, testAccount.publicKey);
          
          try {
            const tokenAccount = await getAccount(connection, ata);
            const tokenBalance = Number(tokenAccount.amount) / 1_000_000;
            console.log(`   ✅ Token Balance: ${tokenBalance} tokens`);
            console.log(`   - Token Account: ${ata.toBase58()}`);
            console.log(`   - 🔗 Account Explorer: ${getExplorerLink(ata.toBase58(), "address")}`);
            console.log();

            // 8. Get Sell Quote
            console.log("8️⃣  Getting Sell Quote...");
            const sellAmount = BigInt(Math.floor(Number(tokenAccount.amount) / 2)); // Sell 50%
            
            if (sellAmount > BigInt(0)) {
              const sellQuote = await sdk.getSellQuote(tradingToken, sellAmount, BigInt(500));
              console.log("   ✅ Sell quote calculated:");
              console.log(`   - Tokens to sell: ${Number(sellAmount) / 1_000_000}`);
              console.log(`   - SOL to receive: ${Number(sellQuote.solAmount) / LAMPORTS_PER_SOL} SOL`);
              console.log(`   - Price impact: ${sellQuote.priceImpact.toFixed(4)}%`);
              console.log();

              // 9. Execute Sell
              console.log("9️⃣  Executing SELL Transaction...");
              console.log(`   Selling ${Number(sellAmount) / 1_000_000} tokens for ~${Number(sellQuote.solAmount) / LAMPORTS_PER_SOL} SOL...`);
              
              const sellResult = await sdk.sell(
                testAccount,
                tradingToken,
                sellAmount,
                BigInt(500), // 5% slippage
                {
                  unitLimit: 400000,
                  unitPrice: 100000,
                }
              );

              if (sellResult.success) {
                console.log("   ✅ SELL SUCCESSFUL!");
                console.log(`   - Transaction Signature: ${sellResult.signature}`);
                console.log(`   - 🔗 Transaction Explorer: ${getExplorerLink(sellResult.signature, "tx")}`);
                console.log(`   - Block: ${sellResult.results?.slot || "pending"}`);
                console.log();
              } else {
                console.log("   ❌ Sell failed:", sellResult.error);
                console.log();
              }
            }
          } catch (error) {
            console.log("   ⚠️  Could not fetch token balance");
          }
        } else {
          console.log("   ❌ Buy failed:", buyResult.error);
          console.log();
        }
      } catch (error) {
        console.log(`   ❌ Buy transaction failed: ${error.message}`);
        console.log();
      }
    } else {
      console.log("6️⃣  ⚠️  Skipping Buy Transaction (insufficient balance)");
      console.log(`   Need: ${Number(buyAmount) / LAMPORTS_PER_SOL} SOL`);
      console.log(`   Have: ${balance / LAMPORTS_PER_SOL} SOL`);
      console.log(`   Please fund account: ${testAccount.publicKey.toBase58()}`);
      console.log();
    }

    console.log("=".repeat(80));
    console.log("✅ SDK Test Complete!");
    console.log("=".repeat(80));
    console.log();
    console.log("🔗 Useful Links:");
    console.log(`   - Test Account: ${getExplorerLink(testAccount.publicKey.toBase58(), "address")}`);
    console.log(`   - Program: ${getExplorerLink(sdk.program.programId.toBase58(), "address")}`);
    console.log(`   - Eclipse Explorer: ${EXPLORER_URL}`);
    console.log();

  } catch (error) {
    console.log("\n❌ Test Failed:");
    console.error(error);
    console.log();
  }
}

testSDKWithTransactions().catch(console.error);
