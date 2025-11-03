import {
  Commitment,
  Connection,
  Finality,
  Keypair,
  PublicKey,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Program, Provider } from "@coral-xyz/anchor";
import { GlobalAccount } from "./globalAccount";
import {
  PriorityFee,
  TransactionResult,
  BuyQuote,
  SellQuote,
} from "./types";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { BondingCurveAccount } from "./bondingCurveAccount";
import { BN } from "bn.js";
import {
  DEFAULT_COMMITMENT,
  DEFAULT_FINALITY,
  calculateWithSlippageBuy,
  calculateWithSlippageSell,
  sendTx,
} from "./util";
import { Yoink, IDL } from "./IDL/yoink";

const PROGRAM_ID = "HbiDw6U515iWwHQ4edjmceT24ST7akg7z5rhXRhBac4J";

export const GLOBAL_ACCOUNT_SEED = "global";
export const BONDING_CURVE_SEED = "bonding-curve";
export const HOLDER_STATS_SEED = "holder-stats";

export const DEFAULT_DECIMALS = 6;

export class YoinkSDK {
  public program: Program<Yoink>;
  public connection: Connection;

  constructor(provider?: Provider) {
    this.program = new Program<Yoink>(IDL as Yoink, provider);
    this.connection = this.program.provider.connection;
  }

  /**
   * Buy tokens with SOL
   * @param buyer - Keypair of the buyer
   * @param mint - PublicKey of the token mint
   * @param solAmount - Amount of SOL to spend (in lamports)
   * @param slippageBasisPoints - Slippage tolerance in basis points (e.g., 500 = 5%)
   * @param priorityFees - Optional priority fees
   * @param commitment - Transaction commitment level
   * @param finality - Transaction finality level
   * @returns TransactionResult with signature and success status
   */
  async buy(
    buyer: Keypair,
    mint: PublicKey,
    solAmount: bigint,
    slippageBasisPoints: bigint = BigInt(500),
    priorityFees?: PriorityFee,
    commitment: Commitment = DEFAULT_COMMITMENT,
    finality: Finality = DEFAULT_FINALITY
  ): Promise<TransactionResult> {
    const buyTx = await this.getBuyInstructions(
      buyer.publicKey,
      mint,
      solAmount,
      slippageBasisPoints,
      commitment
    );

    const buyResults = await sendTx(
      this.connection,
      buyTx,
      buyer.publicKey,
      [buyer],
      priorityFees,
      commitment,
      finality
    );
    return buyResults;
  }

  /**
   * Sell tokens for SOL
   * @param seller - Keypair of the seller
   * @param mint - PublicKey of the token mint
   * @param tokenAmount - Amount of tokens to sell (in base units, with decimals)
   * @param slippageBasisPoints - Slippage tolerance in basis points (e.g., 500 = 5%)
   * @param priorityFees - Optional priority fees
   * @param commitment - Transaction commitment level
   * @param finality - Transaction finality level
   * @returns TransactionResult with signature and success status
   */
  async sell(
    seller: Keypair,
    mint: PublicKey,
    tokenAmount: bigint,
    slippageBasisPoints: bigint = BigInt(500),
    priorityFees?: PriorityFee,
    commitment: Commitment = DEFAULT_COMMITMENT,
    finality: Finality = DEFAULT_FINALITY
  ): Promise<TransactionResult> {
    const sellTx = await this.getSellInstructions(
      seller.publicKey,
      mint,
      tokenAmount,
      slippageBasisPoints,
      commitment
    );

    const sellResults = await sendTx(
      this.connection,
      sellTx,
      seller.publicKey,
      [seller],
      priorityFees,
      commitment,
      finality
    );
    return sellResults;
  }

  /**
   * Get a quote for buying tokens with a specific SOL amount
   * @param mint - PublicKey of the token mint
   * @param solAmount - Amount of SOL to spend (in lamports)
   * @param slippageBasisPoints - Slippage tolerance in basis points
   * @param commitment - Query commitment level
   * @returns BuyQuote with token amount, SOL cost, and price info
   */
  async getBuyQuote(
    mint: PublicKey,
    solAmount: bigint,
    slippageBasisPoints: bigint = BigInt(500),
    commitment: Commitment = DEFAULT_COMMITMENT
  ): Promise<BuyQuote> {
    const bondingCurve = await this.getBondingCurveAccount(mint, commitment);
    if (!bondingCurve) {
      throw new Error(`Bonding curve not found for mint: ${mint.toBase58()}`);
    }

    const globalAccount = await this.getGlobalAccount(commitment);
    
    // Calculate fee (e.g., 4% = 400 basis points)
    const fee = (solAmount * globalAccount.feeBasisPoints) / BigInt(10000);
    const solAfterFee = solAmount - fee;
    
    // Calculate how many tokens we get
    const tokenAmount = bondingCurve.getBuyPrice(solAfterFee);
    
    // Calculate with slippage
    const solAmountWithSlippage = calculateWithSlippageBuy(
      solAmount,
      slippageBasisPoints
    );
    
    // Calculate price per token in SOL
    const pricePerToken = Number(solAmount) / Number(tokenAmount);
    
    // Calculate price impact
    const currentPrice = bondingCurve.getPricePerToken();
    const newPrice = Number(bondingCurve.virtualSolReserves + solAfterFee) / 
                     Number(bondingCurve.virtualTokenReserves - tokenAmount);
    const priceImpact = ((newPrice - currentPrice) / currentPrice) * 100;
    
    return {
      tokenAmount,
      solAmount,
      solAmountWithSlippage,
      pricePerToken,
      priceImpact,
    };
  }

  /**
   * Get a quote for selling tokens
   * @param mint - PublicKey of the token mint
   * @param tokenAmount - Amount of tokens to sell (in base units)
   * @param slippageBasisPoints - Slippage tolerance in basis points
   * @param commitment - Query commitment level
   * @returns SellQuote with SOL amount, token cost, and price info
   */
  async getSellQuote(
    mint: PublicKey,
    tokenAmount: bigint,
    slippageBasisPoints: bigint = BigInt(500),
    commitment: Commitment = DEFAULT_COMMITMENT
  ): Promise<SellQuote> {
    const bondingCurve = await this.getBondingCurveAccount(mint, commitment);
    if (!bondingCurve) {
      throw new Error(`Bonding curve not found for mint: ${mint.toBase58()}`);
    }

    const globalAccount = await this.getGlobalAccount(commitment);
    
    // Calculate SOL received before fees
    const solBeforeFee = bondingCurve.getSellPrice(tokenAmount);
    
    // Apply fee (e.g., 4% = 400 basis points)
    const fee = (solBeforeFee * globalAccount.feeBasisPoints) / BigInt(10000);
    const solAmount = solBeforeFee - fee;
    
    // Calculate with slippage
    const solAmountWithSlippage = calculateWithSlippageSell(
      solAmount,
      slippageBasisPoints
    );
    
    // Calculate price per token in SOL
    const pricePerToken = Number(solAmount) / Number(tokenAmount);
    
    // Calculate price impact
    const currentPrice = bondingCurve.getPricePerToken();
    const newPrice = Number(bondingCurve.virtualSolReserves - solBeforeFee) / 
                     Number(bondingCurve.virtualTokenReserves + tokenAmount);
    const priceImpact = ((currentPrice - newPrice) / currentPrice) * 100;
    
    return {
      tokenAmount,
      solAmount,
      solAmountWithSlippage,
      pricePerToken,
      priceImpact,
    };
  }

  /**
   * Get buy transaction instructions
   */
  async getBuyInstructions(
    buyer: PublicKey,
    mint: PublicKey,
    solAmount: bigint,
    slippageBasisPoints: bigint = BigInt(500),
    commitment: Commitment = DEFAULT_COMMITMENT
  ): Promise<Transaction> {
    const bondingCurve = await this.getBondingCurveAccount(mint, commitment);
    if (!bondingCurve) {
      throw new Error(`Bonding curve not found for mint: ${mint.toBase58()}`);
    }

    const globalAccount = await this.getGlobalAccount(commitment);
    
    // Calculate tokens to buy and max SOL cost
    const quote = await this.getBuyQuote(mint, solAmount, slippageBasisPoints, commitment);
    
    const associatedBondingCurve = await getAssociatedTokenAddress(
      mint,
      this.getBondingCurvePDA(mint),
      true
    );

    const associatedUser = await getAssociatedTokenAddress(mint, buyer, false);

    const transaction = new Transaction();

    // Create token account if needed
    try {
      await getAccount(this.connection, associatedUser, commitment);
    } catch (e) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          buyer,
          associatedUser,
          buyer,
          mint
        )
      );
    }

    // Initialize holder stats if needed
    const holderStatsPda = this.getHolderStatsPDA(mint, buyer);
    const holderStatsInfo = await this.connection.getAccountInfo(holderStatsPda, commitment);
    
    if (!holderStatsInfo) {
      transaction.add(
        await this.program.methods
          .initHolderStats()
          .accounts({
            mint: mint,
            associatedUser: associatedUser,
            user: buyer,
          } as any)
          .instruction()
      );
    }

    // Add buy instruction
    transaction.add(
      await this.program.methods
        .buy(
          new BN(quote.tokenAmount.toString()),
          new BN(quote.solAmountWithSlippage.toString())
        )
        .accounts({
          mint: mint,
          associatedUser: associatedUser,
          user: buyer,
          feeRecipient: globalAccount.feeRecipient,
        } as any)
        .instruction()
    );

    return transaction;
  }

  /**
   * Get sell transaction instructions
   */
  async getSellInstructions(
    seller: PublicKey,
    mint: PublicKey,
    tokenAmount: bigint,
    slippageBasisPoints: bigint = BigInt(500),
    commitment: Commitment = DEFAULT_COMMITMENT
  ): Promise<Transaction> {
    const bondingCurve = await this.getBondingCurveAccount(mint, commitment);
    if (!bondingCurve) {
      throw new Error(`Bonding curve not found for mint: ${mint.toBase58()}`);
    }

    const globalAccount = await this.getGlobalAccount(commitment);
    
    // Calculate quote
    const quote = await this.getSellQuote(mint, tokenAmount, slippageBasisPoints, commitment);
    
    const associatedBondingCurve = await getAssociatedTokenAddress(
      mint,
      this.getBondingCurvePDA(mint),
      true
    );

    const associatedUser = await getAssociatedTokenAddress(mint, seller, false);

    const transaction = new Transaction();

    // Add sell instruction
    transaction.add(
      await this.program.methods
        .sell(
          new BN(quote.tokenAmount.toString()),
          new BN(quote.solAmountWithSlippage.toString())
        )
        .accounts({
          mint: mint,
          associatedUser: associatedUser,
          user: seller,
          feeRecipient: globalAccount.feeRecipient,
        } as any)
        .instruction()
    );

    return transaction;
  }

  /**
   * Fetch bonding curve account data
   */
  async getBondingCurveAccount(
    mint: PublicKey,
    commitment: Commitment = DEFAULT_COMMITMENT
  ): Promise<BondingCurveAccount | null> {
    const bondingCurvePDA = this.getBondingCurvePDA(mint);
    
    try {
      const accountInfo = await this.connection.getAccountInfo(
        bondingCurvePDA,
        commitment
      );
      
      if (!accountInfo) {
        return null;
      }
      
      return BondingCurveAccount.fromBuffer(accountInfo.data);
    } catch (error) {
      console.error("Error fetching bonding curve:", error);
      return null;
    }
  }

  /**
   * Fetch global account data
   */
  async getGlobalAccount(
    commitment: Commitment = DEFAULT_COMMITMENT
  ): Promise<GlobalAccount> {
    const globalPDA = this.getGlobalPDA();
    
    const accountInfo = await this.connection.getAccountInfo(
      globalPDA,
      commitment
    );
    
    if (!accountInfo) {
      throw new Error("Global account not found");
    }
    
    return GlobalAccount.fromBuffer(accountInfo.data);
  }

  /**
   * Get bonding curve PDA
   */
  getBondingCurvePDA(mint: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(BONDING_CURVE_SEED), mint.toBuffer()],
      this.program.programId
    )[0];
  }

  /**
   * Get global state PDA
   */
  getGlobalPDA(): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_ACCOUNT_SEED)],
      this.program.programId
    )[0];
  }

  /**
   * Get holder stats PDA
   */
  getHolderStatsPDA(mint: PublicKey, user: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(HOLDER_STATS_SEED), mint.toBuffer(), user.toBuffer()],
      this.program.programId
    )[0];
  }
}
