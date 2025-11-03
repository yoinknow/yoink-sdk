import dotenv from "dotenv";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { YoinkSDK, DEFAULT_DECIMALS } from "../../src";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { AnchorProvider } from "@coral-xyz/anchor";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const KEYS_FOLDER = __dirname + "/.keys";
const SLIPPAGE_BASIS_POINTS = BigInt(500); // 5% slippage

/**
 * Get or create a keypair from file
 */
function getOrCreateKeypair(folder: string, name: string): Keypair {
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
    console.log(`Created new keypair: ${name} - ${keypair.publicKey.toBase58()}`);
    return keypair;
  }
}

/**
 * Get Anchor provider
 */
function getProvider(): AnchorProvider {
  if (!process.env.ECLIPSE_RPC_URL) {
    throw new Error("Please set ECLIPSE_RPC_URL in .env file");
  }

  const connection = new Connection(process.env.ECLIPSE_RPC_URL);
  const wallet = new NodeWallet(new Keypair());
  return new AnchorProvider(connection, wallet, { commitment: "confirmed" });
}

/**
 * Print SOL balance
 */
async function printSOLBalance(
  connection: Connection,
  pubkey: PublicKey,
  label: string
) {
  const balance = await connection.getBalance(pubkey);
  console.log(`${label}: ${(balance / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
}

/**
 * Print token balance
 */
async function printTokenBalance(
  sdk: YoinkSDK,
  mint: PublicKey,
  owner: PublicKey,
  label: string
) {
  try {
    const { getAccount, getAssociatedTokenAddress } = await import("@solana/spl-token");
    const ata = await getAssociatedTokenAddress(mint, owner);
    const account = await getAccount(sdk.connection, ata);
    const balance = Number(account.amount) / Math.pow(10, DEFAULT_DECIMALS);
    console.log(`${label}: ${balance.toFixed(2)} tokens`);
  } catch (e) {
    console.log(`${label}: 0 tokens (account not found)`);
  }
}

/**
 * Main example function
 */
async function main() {
  console.log("=".repeat(80));
  console.log("Yoink SDK Example - Buy and Sell Demo");
  console.log("=".repeat(80));
  console.log();

  // Initialize SDK
  const provider = getProvider();
  const sdk = new YoinkSDK(provider);
  const connection = provider.connection;

  // Get or create test account
  const testAccount = getOrCreateKeypair(KEYS_FOLDER, "test-account");
  console.log(`Test Account: ${testAccount.publicKey.toBase58()}`);
  
  await printSOLBalance(connection, testAccount.publicKey, "Initial Balance");
  console.log();

  // Check if account needs funding
  const currentBalance = await connection.getBalance(testAccount.publicKey);
  if (currentBalance === 0) {
    console.log("⚠️  Test account has no SOL!");
    console.log("Please fund the test account before continuing:");
    console.log(testAccount.publicKey.toBase58());
    return;
  }

  // Example mint address - replace with an actual token mint
  // For this example, you'd need to create a token first or use an existing one
  const EXAMPLE_MINT = new PublicKey("REPLACE_WITH_ACTUAL_MINT_ADDRESS");
  
  console.log(`Token Mint: ${EXAMPLE_MINT.toBase58()}`);
  console.log();

  try {
    // === Fetch Global Account ===
    console.log("Fetching global account...");
    const globalAccount = await sdk.getGlobalAccount();
    console.log(`Fee Basis Points: ${globalAccount.feeBasisPoints.toString()} (${Number(globalAccount.feeBasisPoints) / 100}%)`);
    console.log(`Fee Recipient: ${globalAccount.feeRecipient.toBase58()}`);
    console.log();

    // === Fetch Bonding Curve ===
    console.log("Fetching bonding curve...");
    const bondingCurve = await sdk.getBondingCurveAccount(EXAMPLE_MINT);
    
    if (!bondingCurve) {
      console.log("❌ Bonding curve not found for this mint!");
      console.log("Make sure to use a valid token mint address.");
      return;
    }

    console.log(`✅ Bonding Curve Status:`);
    console.log(`   Virtual Token Reserves: ${bondingCurve.virtualTokenReserves.toString()}`);
    console.log(`   Virtual SOL Reserves: ${Number(bondingCurve.virtualSolReserves) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   Real Token Reserves: ${bondingCurve.realTokenReserves.toString()}`);
    console.log(`   Real SOL Reserves: ${Number(bondingCurve.realSolReserves) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   Complete: ${bondingCurve.complete ? "YES" : "NO"}`);
    console.log(`   Market Cap: ${Number(bondingCurve.getMarketCapSOL()) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   Price per Token: ${bondingCurve.getPricePerToken() * LAMPORTS_PER_SOL} SOL`);
    console.log();

    // === Get Buy Quote ===
    console.log("Getting buy quote for 0.01 SOL...");
    const buyAmount = BigInt(0.01 * LAMPORTS_PER_SOL);
    const buyQuote = await sdk.getBuyQuote(
      EXAMPLE_MINT,
      buyAmount,
      SLIPPAGE_BASIS_POINTS
    );
    
    console.log(`✅ Buy Quote:`);
    console.log(`   SOL Amount: ${Number(buyQuote.solAmount) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   Token Amount: ${Number(buyQuote.tokenAmount) / Math.pow(10, DEFAULT_DECIMALS)}`);
    console.log(`   SOL with Slippage: ${Number(buyQuote.solAmountWithSlippage) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   Price per Token: ${buyQuote.pricePerToken} SOL`);
    console.log(`   Price Impact: ${buyQuote.priceImpact.toFixed(2)}%`);
    console.log();

    // === Execute Buy ===
    console.log("Executing buy transaction...");
    const buyResult = await sdk.buy(
      testAccount,
      EXAMPLE_MINT,
      buyAmount,
      SLIPPAGE_BASIS_POINTS,
      {
        unitLimit: 400000,
        unitPrice: 100000,
      }
    );

    if (buyResult.success) {
      console.log(`✅ Buy successful!`);
      console.log(`   Signature: ${buyResult.signature}`);
      await printTokenBalance(sdk, EXAMPLE_MINT, testAccount.publicKey, "   Token Balance");
      await printSOLBalance(connection, testAccount.publicKey, "   SOL Balance");
    } else {
      console.log(`❌ Buy failed:`, buyResult.error);
    }
    console.log();

    // Wait a bit for the transaction to settle
    await new Promise(resolve => setTimeout(resolve, 2000));

    // === Get Sell Quote ===
    console.log("Getting sell quote for 50% of holdings...");
    
    // Get current token balance
    const { getAccount, getAssociatedTokenAddress } = await import("@solana/spl-token");
    const ata = await getAssociatedTokenAddress(EXAMPLE_MINT, testAccount.publicKey);
    const tokenAccount = await getAccount(sdk.connection, ata);
    const currentTokenBalance = tokenAccount.amount;
    
    if (currentTokenBalance === BigInt(0)) {
      console.log("No tokens to sell!");
      return;
    }

    const sellAmount = currentTokenBalance / BigInt(2); // Sell 50%
    
    const sellQuote = await sdk.getSellQuote(
      EXAMPLE_MINT,
      sellAmount,
      SLIPPAGE_BASIS_POINTS
    );
    
    console.log(`✅ Sell Quote:`);
    console.log(`   Token Amount: ${Number(sellQuote.tokenAmount) / Math.pow(10, DEFAULT_DECIMALS)}`);
    console.log(`   SOL Amount: ${Number(sellQuote.solAmount) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   SOL with Slippage: ${Number(sellQuote.solAmountWithSlippage) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   Price per Token: ${sellQuote.pricePerToken} SOL`);
    console.log(`   Price Impact: ${sellQuote.priceImpact.toFixed(2)}%`);
    console.log();

    // === Execute Sell ===
    console.log("Executing sell transaction...");
    const sellResult = await sdk.sell(
      testAccount,
      EXAMPLE_MINT,
      sellAmount,
      SLIPPAGE_BASIS_POINTS,
      {
        unitLimit: 400000,
        unitPrice: 100000,
      }
    );

    if (sellResult.success) {
      console.log(`✅ Sell successful!`);
      console.log(`   Signature: ${sellResult.signature}`);
      await printTokenBalance(sdk, EXAMPLE_MINT, testAccount.publicKey, "   Token Balance");
      await printSOLBalance(connection, testAccount.publicKey, "   SOL Balance");
    } else {
      console.log(`❌ Sell failed:`, sellResult.error);
    }
    console.log();

    console.log("=".repeat(80));
    console.log("Demo completed!");
    console.log("=".repeat(80));

  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Run the example
main().catch(console.error);
