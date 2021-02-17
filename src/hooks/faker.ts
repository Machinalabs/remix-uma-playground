import { BigNumber, utils } from "ethers"
import { toWei } from "web3-utils"
import { getUMAAddresses } from "./useUMARegistry"

export const buildFakeEMP = () => {
  const allUMAAddresses = getUMAAddresses()

  return {
    expirationTimestamp: BigNumber.from(new Date(2030, 10, 10).getTime()),
    collateralAddress: allUMAAddresses.get("WETH") as string,
    priceFeedIdentifier: utils.formatBytes32String("ETH/USD"),
    syntheticName: "yUSD",
    syntheticSymbol: "yUSD",
    collateralRequirement: {
      rawValue: toWei(`1.25`),
    },
    disputeBondPct: {
      rawValue: toWei("0.1"),
    },
    sponsorDisputeRewardPct: {
      rawValue: toWei("0.1"),
    },
    disputerDisputeRewardPct: {
      rawValue: toWei("0.1"),
    },
    minSponsorTokens: {
      rawValue: toWei("100"),
    },
    liquidationLiveness: BigNumber.from(7200),
    withdrawalLiveness: BigNumber.from(7200),
    excessTokenBeneficiary: allUMAAddresses.get("Store"),
  }
}
