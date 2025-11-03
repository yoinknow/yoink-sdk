import { struct, u64, bool, Layout, publicKey } from "@coral-xyz/borsh";
import { PublicKey } from "@solana/web3.js";

export class GlobalAccount {
  public discriminator: bigint;
  public initialized: boolean;
  public authority: PublicKey;
  public feeRecipient: PublicKey;
  public initialVirtualTokenReserves: bigint;
  public initialVirtualSolReserves: bigint;
  public initialRealTokenReserves: bigint;
  public tokenTotalSupply: bigint;
  public feeBasisPoints: bigint;
  public creatorFeeShare: bigint;
  public platformFeeShare: bigint;
  public treasuryFeeShare: bigint;
  public earlyBirdFeeShare: bigint;
  public buybacksEnabled: boolean;
  public earlyBirdEnabled: boolean;
  public earlyBirdCutoff: bigint;
  public earlyBirdMinBuySol: bigint;

  constructor(
    discriminator: bigint,
    initialized: boolean,
    authority: PublicKey,
    feeRecipient: PublicKey,
    initialVirtualTokenReserves: bigint,
    initialVirtualSolReserves: bigint,
    initialRealTokenReserves: bigint,
    tokenTotalSupply: bigint,
    feeBasisPoints: bigint,
    creatorFeeShare: bigint,
    platformFeeShare: bigint,
    treasuryFeeShare: bigint,
    earlyBirdFeeShare: bigint,
    buybacksEnabled: boolean,
    earlyBirdEnabled: boolean,
    earlyBirdCutoff: bigint,
    earlyBirdMinBuySol: bigint
  ) {
    this.discriminator = discriminator;
    this.initialized = initialized;
    this.authority = authority;
    this.feeRecipient = feeRecipient;
    this.initialVirtualTokenReserves = initialVirtualTokenReserves;
    this.initialVirtualSolReserves = initialVirtualSolReserves;
    this.initialRealTokenReserves = initialRealTokenReserves;
    this.tokenTotalSupply = tokenTotalSupply;
    this.feeBasisPoints = feeBasisPoints;
    this.creatorFeeShare = creatorFeeShare;
    this.platformFeeShare = platformFeeShare;
    this.treasuryFeeShare = treasuryFeeShare;
    this.earlyBirdFeeShare = earlyBirdFeeShare;
    this.buybacksEnabled = buybacksEnabled;
    this.earlyBirdEnabled = earlyBirdEnabled;
    this.earlyBirdCutoff = earlyBirdCutoff;
    this.earlyBirdMinBuySol = earlyBirdMinBuySol;
  }

  /**
   * Calculate total fee for a buy in lamports
   */
  calculateBuyFee(solAmount: bigint): bigint {
    return (solAmount * this.feeBasisPoints) / BigInt(10000);
  }

  /**
   * Calculate SOL amount after deducting fee
   */
  calculateSolAfterFee(solAmount: bigint): bigint {
    const fee = this.calculateBuyFee(solAmount);
    return solAmount - fee;
  }

  public static fromBuffer(buffer: Buffer): GlobalAccount {
    // Simplified decoder - would need full layout in production
    const structure: Layout<any> = struct([
      u64("discriminator"),
      bool("initialized"),
      publicKey("authority"),
      publicKey("feeRecipient"),
      u64("initialVirtualTokenReserves"),
      u64("initialVirtualSolReserves"),
      u64("initialRealTokenReserves"),
      u64("tokenTotalSupply"),
      u64("feeBasisPoints"),
    ]);

    let value = structure.decode(buffer);
    
    return new GlobalAccount(
      BigInt(value.discriminator),
      value.initialized,
      value.authority,
      value.feeRecipient,
      BigInt(value.initialVirtualTokenReserves),
      BigInt(value.initialVirtualSolReserves),
      BigInt(value.initialRealTokenReserves),
      BigInt(value.tokenTotalSupply),
      BigInt(value.feeBasisPoints),
      BigInt(0), // creatorFeeShare - would decode from buffer
      BigInt(0), // platformFeeShare
      BigInt(0), // treasuryFeeShare
      BigInt(0), // earlyBirdFeeShare
      false, // buybacksEnabled
      false, // earlyBirdEnabled
      BigInt(0), // earlyBirdCutoff
      BigInt(0)  // earlyBirdMinBuySol
    );
  }
}
