import { struct, bool, u64, Layout } from "@coral-xyz/borsh";

export class BondingCurveAccount {
  public discriminator: bigint;
  public virtualTokenReserves: bigint;
  public virtualSolReserves: bigint;
  public realTokenReserves: bigint;
  public realSolReserves: bigint;
  public tokenTotalSupply: bigint;
  public circulatingSupply: bigint;
  public complete: boolean;
  public totalBurnedSupply: bigint;
  public totalTreasurySpent: bigint;
  public creatorWallet: string;
  public creatorFeePool: bigint;
  public treasuryFeePool: bigint;
  public totalFeesAccrued: bigint;
  public totalTreasuryFeesAccrued: bigint;
  public emaLotPrice: bigint;
  public earlyBirdPool: bigint;
  public totalBuyers: bigint;
  public totalEarlyBirdFeesAccrued: bigint;
  public earlyBirdValidCount: bigint;
  public earlyBirdSharePerSeat: bigint;

  constructor(
    discriminator: bigint,
    virtualTokenReserves: bigint,
    virtualSolReserves: bigint,
    realTokenReserves: bigint,
    realSolReserves: bigint,
    tokenTotalSupply: bigint,
    circulatingSupply: bigint,
    complete: boolean,
    totalBurnedSupply: bigint,
    totalTreasurySpent: bigint,
    creatorWallet: string,
    creatorFeePool: bigint,
    treasuryFeePool: bigint,
    totalFeesAccrued: bigint,
    totalTreasuryFeesAccrued: bigint,
    emaLotPrice: bigint,
    earlyBirdPool: bigint,
    totalBuyers: bigint,
    totalEarlyBirdFeesAccrued: bigint,
    earlyBirdValidCount: bigint,
    earlyBirdSharePerSeat: bigint
  ) {
    this.discriminator = discriminator;
    this.virtualTokenReserves = virtualTokenReserves;
    this.virtualSolReserves = virtualSolReserves;
    this.realTokenReserves = realTokenReserves;
    this.realSolReserves = realSolReserves;
    this.tokenTotalSupply = tokenTotalSupply;
    this.circulatingSupply = circulatingSupply;
    this.complete = complete;
    this.totalBurnedSupply = totalBurnedSupply;
    this.totalTreasurySpent = totalTreasurySpent;
    this.creatorWallet = creatorWallet;
    this.creatorFeePool = creatorFeePool;
    this.treasuryFeePool = treasuryFeePool;
    this.totalFeesAccrued = totalFeesAccrued;
    this.totalTreasuryFeesAccrued = totalTreasuryFeesAccrued;
    this.emaLotPrice = emaLotPrice;
    this.earlyBirdPool = earlyBirdPool;
    this.totalBuyers = totalBuyers;
    this.totalEarlyBirdFeesAccrued = totalEarlyBirdFeesAccrued;
    this.earlyBirdValidCount = earlyBirdValidCount;
    this.earlyBirdSharePerSeat = earlyBirdSharePerSeat;
  }

  /**
   * Calculate how many tokens you get for a given SOL amount (before fees)
   * This should match the contract's buy_quote function exactly
   */
  getBuyPrice(solAmount: bigint): bigint {
    if (this.complete) {
      throw new Error("Bonding curve is complete");
    }

    if (solAmount <= BigInt(0)) {
      return BigInt(0);
    }

    // We need to reverse the contract's buy_quote formula to find token amount
    // Contract: sol_cost = (token_amount * virtual_sol_reserves) / (virtual_token_reserves - token_amount)
    // Rearranging: token_amount = (sol_cost * virtual_token_reserves) / (virtual_sol_reserves + sol_cost)
    
    const virtualSolReserves = BigInt(this.virtualSolReserves);
    const virtualTokenReserves = BigInt(this.virtualTokenReserves);
    
    const tokenAmount = (solAmount * virtualTokenReserves) / (virtualSolReserves + solAmount);
    
    // Cap at real token reserves
    return tokenAmount < this.realTokenReserves 
      ? tokenAmount 
      : this.realTokenReserves;
  }

  /**
   * Calculate how much SOL you get for selling a given token amount (before fees)
   * This matches the contract's sell_quote function exactly
   */
  getSellPrice(tokenAmount: bigint): bigint {
    if (this.complete) {
      throw new Error("Bonding curve is complete");
    }

    if (tokenAmount <= BigInt(0)) {
      return BigInt(0);
    }

    // Contract: sol_output = (amount * virtual_sol_reserves) / (virtual_token_reserves + amount)
    const virtualSolReserves = BigInt(this.virtualSolReserves);
    const virtualTokenReserves = BigInt(this.virtualTokenReserves);
    
    const solAmount = (tokenAmount * virtualSolReserves) / (virtualTokenReserves + tokenAmount);
    
    return solAmount < this.realSolReserves 
      ? solAmount 
      : this.realSolReserves;
  }

  /**
   * Get current market cap in SOL
   */
  getMarketCapSOL(): bigint {
    if (this.virtualTokenReserves === BigInt(0)) {
      return BigInt(0);
    }

    return (
      (this.tokenTotalSupply * this.virtualSolReserves) /
      this.virtualTokenReserves
    );
  }

  /**
   * Get price per token in SOL (for 1 actual token, accounting for decimals)
   */
  getPricePerToken(): number {
    if (this.virtualTokenReserves === BigInt(0)) {
      return 0;
    }
    
    // Price for 1 token with 6 decimals (1,000,000 base units)
    const oneTokenWithDecimals = BigInt(Math.pow(10, 6)); // 1,000,000 for 6 decimals
    
    // Calculate how much SOL it would cost to buy 1 actual token
    // Using contract formula: sol_cost = (token_amount * virtual_sol_reserves) / (virtual_token_reserves - token_amount)
    const virtualSolReserves = BigInt(this.virtualSolReserves);
    const virtualTokenReserves = BigInt(this.virtualTokenReserves);
    
    const solCostForOneToken = (oneTokenWithDecimals * virtualSolReserves) / (virtualTokenReserves - oneTokenWithDecimals);
    
    // Convert from lamports to SOL
    const priceInSOL = Number(solCostForOneToken) / 1_000_000_000; // LAMPORTS_PER_SOL
    
    return priceInSOL;
  }

  public static fromBuffer(buffer: Buffer): BondingCurveAccount {
    // This is a simplified version - in production you'd need the full account layout
    // For now we'll decode the critical fields
    const structure: Layout<any> = struct([
      u64("discriminator"),
      u64("virtualTokenReserves"),
      u64("virtualSolReserves"),
      u64("realTokenReserves"),
      u64("realSolReserves"),
      u64("tokenTotalSupply"),
      u64("circulatingSupply"),
      bool("complete"),
      u64("totalBurnedSupply"),
      u64("totalTreasurySpent"),
      // Additional fields would go here
    ]);

    let value = structure.decode(buffer);
    
    return new BondingCurveAccount(
      BigInt(value.discriminator),
      BigInt(value.virtualTokenReserves),
      BigInt(value.virtualSolReserves),
      BigInt(value.realTokenReserves),
      BigInt(value.realSolReserves),
      BigInt(value.tokenTotalSupply),
      BigInt(value.circulatingSupply || value.tokenTotalSupply),
      value.complete,
      BigInt(value.totalBurnedSupply || 0),
      BigInt(value.totalTreasurySpent || 0),
      "", // creatorWallet - would need to decode from buffer
      BigInt(0), // creatorFeePool
      BigInt(0), // treasuryFeePool
      BigInt(0), // totalFeesAccrued
      BigInt(0), // totalTreasuryFeesAccrued
      BigInt(0), // emaLotPrice
      BigInt(0), // earlyBirdPool
      BigInt(0), // totalBuyers
      BigInt(0), // totalEarlyBirdFeesAccrued
      BigInt(0), // earlyBirdValidCount
      BigInt(0)  // earlyBirdSharePerSeat
    );
  }
}
