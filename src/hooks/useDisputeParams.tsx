import { formatUnits, parseBytes32String } from "ethers/lib/utils";
import { useEffect, useState } from "react";
import { fromWei } from "web3-utils";
import { EthereumAddress } from "../types";
import { useEMPData } from "./useEMPData";

interface DisputeParams {
    // liquidationBond: number
    // disputeBond: number
    // disputeRewardForSponsor: number
    // disputeRewardForDisputer: number
    withdrawalLiveness: string
    liquidationLiveness: string
}

export const useDisputeParams = (empAddress: EthereumAddress): DisputeParams => {
    const { state: empState } = useEMPData(empAddress)

    const [liquidationLiveness, setLiquidationLiveness] = useState<string>("")
    const [withdrawalLiveness, setWithdrawalLiveness] = useState<string>("")

    useEffect(() => {
        if (empState) {
            const { liquidationLiveness: liqLiveness, withdrawalLiveness: withLiveness } = empState

            const withdrawalLivenessInMinutes = (Number(withLiveness) / 60).toFixed(2)
            const liquidationLivenessInMinutes = (Number(liqLiveness) / 60).toFixed(2);

            setLiquidationLiveness(liquidationLivenessInMinutes)
            setWithdrawalLiveness(withdrawalLivenessInMinutes)
        }
    }, [empState])

    return {
        liquidationLiveness,
        withdrawalLiveness
    }
}