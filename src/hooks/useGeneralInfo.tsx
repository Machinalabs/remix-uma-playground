import { formatUnits, parseBytes32String } from "ethers/lib/utils";
import { useEffect, useState } from "react";
import { fromWei } from "web3-utils";
import { DateAsString, EthereumAddress } from "../types";
import { useCollateralToken } from "./useCollateralToken";
import { useEMPData } from "./useEMPData";

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
            const { expirationTimestamp, priceIdentifier, collateralRequirement, minSponsorTokens, isExpired } = empState;
            if (expirationTimestamp && priceIdentifier && collateralRequirement && minSponsorTokens) {
                const expiryDate = new Date(expirationTimestamp.toNumber() * 1000).toLocaleString("en-GB", { timeZone: "UTC" });
                // const prettyLatestPrice = Number(latestPrice).toFixed(8);
                // const pricedGcr = (gcr / latestPrice).toFixed(8);
                const priceIdentifierParsed = parseBytes32String(priceIdentifier);
                const collateralRequirementPercentage = parseFloat(formatUnits(collateralRequirement)).toString();
                // const minSponsorTokensSymbol = `${formatUnits(
                //     minSponsorTokens
                // )} ${tokenSymbol}`;
                setPriceIdentifier(priceIdentifierParsed)
                setExpireDate(expiryDate)
                setCollateralRequirement(collateralRequirementPercentage)
                setIsExpired(isExpired ? "YES" : "NO")
                setMinimumSponsorTokens(fromWei(minSponsorTokens.toString()))
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
        globalCollateralRatio
    }
}