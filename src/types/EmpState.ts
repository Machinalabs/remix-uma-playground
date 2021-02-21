import { BigNumber, Bytes, ContractReceipt, ethers } from "ethers"
import { NumberAsString } from "./types"

export interface EMPState {
  expirationTimestamp: BigNumber
  collateralCurrency: string
  priceIdentifier: Bytes
  tokenCurrency: string
  collateralRequirement: BigNumber
  disputeBondPct: BigNumber
  disputerDisputeRewardPct: BigNumber
  sponsorDisputeRewardPct: BigNumber
  minSponsorTokens: BigNumber
  timerAddress: string
  cumulativeFeeMultiplier: BigNumber
  rawTotalPositionCollateral: BigNumber
  totalTokensOutstanding: BigNumber
  liquidationLiveness: BigNumber
  withdrawalLiveness: BigNumber
  currentTime: BigNumber
  isExpired: boolean
  contractState: number
  finderAddress: string
  expiryPrice: BigNumber
}

export interface TokenState {
  symbol: string
  name: string
  decimals: number
  balance: NumberAsString
  allowance: NumberAsString | "Infinity"
  totalSupply: BigNumber
  setMaxAllowance: () => Promise<ContractReceipt>
  instance: ethers.Contract
}

export interface PositionData {
  collateral: NumberAsString
  backingCollateral: NumberAsString
  syntheticTokens: NumberAsString
  collateralRatio: NumberAsString
  withdrawalAmount: NumberAsString
  withdrawalPassTime: NumberAsString
  pendingWithdraw: NumberAsString
  pendingTransfer: NumberAsString
}

export interface Totals {
  totalCollateral: NumberAsString
  totalSyntheticTokens: NumberAsString
  gcr: NumberAsString
}
