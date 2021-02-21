import { formatUnits, parseBytes32String } from "ethers/lib/utils"
import { useEffect, useState } from "react"
import { fromWei } from "web3-utils"

import { DateAsString } from "../types"
import { useEMPProvider } from "./useEMPProvider"

interface GeneralInfo {
  expireDate: DateAsString
  isExpired: string
  priceIdentifier: string
  // globalCollateralRatio: string TODO
  collateralRequirement: string
  // uniqueSponsors: number TODO
  minimunSponsorTokens: string
}

export const useGeneralInfo = (): GeneralInfo | undefined => {
  const { empState } = useEMPProvider()
  const [generalInfo, setGeneralInfo] = useState<GeneralInfo | undefined>(undefined)

  useEffect(() => {
    if (empState) {
      const { expirationTimestamp, priceIdentifier, collateralRequirement, minSponsorTokens, isExpired } = empState

      if (expirationTimestamp && priceIdentifier && collateralRequirement && minSponsorTokens) {
        const expiryDate = new Date(expirationTimestamp.toNumber() * 1000).toLocaleString("en-GB", { timeZone: "UTC" })
        // const prettyLatestPrice = Number(latestPrice).toFixed(8);
        // const pricedGcr = (gcr / latestPrice).toFixed(8);
        const priceIdentifierParsed = parseBytes32String(priceIdentifier)
        const collateralRequirementPercentage = parseFloat(formatUnits(collateralRequirement)).toString()
        // const minSponsorTokensSymbol = `${formatUnits(
        //     minSponsorTokens
        // )} ${tokenSymbol}`;

        setGeneralInfo({
          priceIdentifier: priceIdentifierParsed,
          expireDate: expiryDate,
          collateralRequirement: collateralRequirementPercentage,
          isExpired: isExpired ? "YES" : "NO",
          minimunSponsorTokens: fromWei(minSponsorTokens.toString()),
        })
      } else {
        setGeneralInfo(undefined)
      }
    }
  }, [empState])

  return generalInfo
}
