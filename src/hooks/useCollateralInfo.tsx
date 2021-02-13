import { useEffect, useState } from "react";

import { EthereumAddress } from "../types";

import { useEMPData } from "./useEMPData";

interface CollateralInfo {
    symbol: string
}

export const useCollateralInfo = (empAddress: EthereumAddress): CollateralInfo => {
    const { state: empState } = useEMPData(empAddress)
    // const { symbol } = useCollateralToken(empAddress)
    // const { symbol } = useSyntheticToken(empAddress)

    const [symbol, setSymbol] = useState<string>("")

    useEffect(() => {
        if (empState) {
            const { expirationTimestamp, priceIdentifier, collateralRequirement, minSponsorTokens, isExpired } = empState;
        }
    }, [empState])

    return {
        symbol
    }
}