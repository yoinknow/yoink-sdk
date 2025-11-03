import { PublicKey, VersionedTransactionResponse } from "@solana/web3.js";

export type PriorityFee = {
  unitLimit: number;
  unitPrice: number;
};

export type TransactionResult = {
  signature?: string;
  error?: unknown;
  results?: VersionedTransactionResponse;
  success: boolean;
};

export type BuyQuote = {
  tokenAmount: bigint;
  solAmount: bigint;
  solAmountWithSlippage: bigint;
  pricePerToken: number;
  priceImpact: number;
};

export type SellQuote = {
  tokenAmount: bigint;
  solAmount: bigint;
  solAmountWithSlippage: bigint;
  pricePerToken: number;
  priceImpact: number;
};
