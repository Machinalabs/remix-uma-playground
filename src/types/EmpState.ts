import { BigNumber, Bytes } from "ethers"

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
