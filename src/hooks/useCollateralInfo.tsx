import { useEffect, useState } from "react"

import { EthereumAddress } from "../types"

import { useEMPProvider } from "./useEMPProvider"

interface CollateralInfo {
  symbol: string
}

export const useCollateralInfo = (empAddress: EthereumAddress): CollateralInfo => {
  const { empState } = useEMPProvider()

  const [symbol, setSymbol] = useState<string>("")

  useEffect(() => {
    if (empState) {
      const { expirationTimestamp, priceIdentifier, collateralRequirement, minSponsorTokens, isExpired } = empState
    }
  }, [empState])

  return {
    symbol,
  }
}
