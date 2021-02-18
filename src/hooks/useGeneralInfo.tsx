import { formatUnits, parseBytes32String } from "ethers/lib/utils"
import { useEffect, useState } from "react"
import { fromWei } from "web3-utils"
import { DateAsString, EthereumAddress } from "../types"
import { useCollateralToken } from "./useCollateralToken"
import { useEMPData } from "./useEMPData"

interface GeneralInfo {
  expireDate: DateAsString
  isExpired: string
  priceIdentifier: string
  globalCollateralRatio: string
  collateralRequirement: string
  // uniqueSponsors: number
  minimunSponsorTokens: string
}

export const useGeneralInfo = (empAddress: EthereumAddress): GeneralInfo => {
  const { state: empState } = useEMPData(empAddress)
  const { symbol } = useCollateralToken(empAddress)
  // const { symbol } = useSyntheticToken(empAddress)
  const [expireDate, setExpireDate] = useState<string>("")
  const [isExpired, setIsExpired] = useState<string>("")
  const [priceIdentifier, setPriceIdentifier] = useState<string>("")
  const [globalCollateralRatio, setGlobalCollateralRatio] = useState<string>("")
  const [collateralRequirement, setCollateralRequirement] = useState<string>("")
  const [minimunSponsorTokens, setMinimumSponsorTokens] = useState<string>("")

  useEffect(() => {
    if (empState) {
      const {
        expirationTimestamp: expTimestamp,
        priceIdentifier: priceId,
        collateralRequirement: collReq,
        minSponsorTokens: minSpons,
        isExpired: isExp,
      } = empState
      if (expTimestamp && priceId && collReq && minSpons) {
        const expiryDate = new Date(expTimestamp.toNumber() * 1000).toLocaleString("en-GB", { timeZone: "UTC" })
        // const prettyLatestPrice = Number(latestPrice).toFixed(8);
        // const pricedGcr = (gcr / latestPrice).toFixed(8);
        const priceIdentifierParsed = parseBytes32String(priceId)
        const collateralRequirementPercentage = parseFloat(formatUnits(collReq)).toString()
        // const minSponsorTokensSymbol = `${formatUnits(
        //     minSponsorTokens
        // )} ${tokenSymbol}`;
        setPriceIdentifier(priceIdentifierParsed)
        setExpireDate(expiryDate)
        setCollateralRequirement(collateralRequirementPercentage)
        setIsExpired(isExp ? "YES" : "NO")
        setMinimumSponsorTokens(fromWei(minSpons.toString()))
      } else {
        setExpireDate("")
        setIsExpired("")
        setPriceIdentifier("")
        setGlobalCollateralRatio("")
        setCollateralRequirement("")
        setMinimumSponsorTokens("")
      }
    }
  }, [empState])

  return {
    expireDate,
    isExpired,
    priceIdentifier,
    collateralRequirement,
    minimunSponsorTokens,
    globalCollateralRatio,
  }
}
