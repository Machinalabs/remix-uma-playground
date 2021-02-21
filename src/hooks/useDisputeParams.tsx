import { useEffect, useState } from "react"

import { useEMPProvider } from "./useEMPProvider"

interface DisputeParams {
  // liquidationBond: number
  // disputeBond: number
  // disputeRewardForSponsor: number
  // disputeRewardForDisputer: number
  withdrawalLiveness: string
  liquidationLiveness: string
}

export const useDisputeParams = (): DisputeParams => {
  const { empState } = useEMPProvider()

  const [liquidationLiveness, setLiquidationLiveness] = useState<string>("")
  const [withdrawalLiveness, setWithdrawalLiveness] = useState<string>("")

  useEffect(() => {
    if (empState) {
      const { liquidationLiveness: liqLiveness, withdrawalLiveness: withLiveness } = empState

      if (liqLiveness && withLiveness) {
        const withdrawalLivenessInMinutes = (Number(withLiveness) / 60).toFixed(2)
        const liquidationLivenessInMinutes = (Number(liqLiveness) / 60).toFixed(2)

        setLiquidationLiveness(liquidationLivenessInMinutes)
        setWithdrawalLiveness(withdrawalLivenessInMinutes)
      } else {
        setLiquidationLiveness("")
        setWithdrawalLiveness("")
      }
    }
  }, [empState])

  return {
    liquidationLiveness,
    withdrawalLiveness,
  }
}
