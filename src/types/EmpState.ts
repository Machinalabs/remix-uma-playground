import { BigNumber, Bytes, ContractReceipt } from "ethers"
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
}
