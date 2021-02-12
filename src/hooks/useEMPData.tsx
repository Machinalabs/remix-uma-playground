import { useEffect, useState } from "react";
import { BigNumber, Bytes } from "ethers";

import { EthereumAddress } from "../types";

import { useWeb3Provider } from "./useWeb3Provider";
import { useEMPAt } from "./useEMPAt";

interface ContractState {
    expirationTimestamp: BigNumber | null;
    collateralCurrency: string | null;
    priceIdentifier: Bytes | null;
    tokenCurrency: string | null;
    collateralRequirement: BigNumber | null;
    disputeBondPct: BigNumber | null;
    disputerDisputeRewardPct: BigNumber | null;
    sponsorDisputeRewardPct: BigNumber | null;
    minSponsorTokens: BigNumber | null;
    timerAddress: string | null;
    cumulativeFeeMultiplier: BigNumber | null;
    rawTotalPositionCollateral: BigNumber | null;
    totalTokensOutstanding: BigNumber | null;
    liquidationLiveness: BigNumber | null;
    withdrawalLiveness: BigNumber | null;
    currentTime: BigNumber | null;
    isExpired: boolean | null;
    contractState: number | null;
    finderAddress: string | null;
    expiryPrice: BigNumber | null;
}

const initState = {
    expirationTimestamp: null,
    collateralCurrency: null,
    priceIdentifier: null,
    tokenCurrency: null,
    collateralRequirement: null,
    disputeBondPct: null,
    disputerDisputeRewardPct: null,
    sponsorDisputeRewardPct: null,
    minSponsorTokens: null,
    timerAddress: null,
    cumulativeFeeMultiplier: null,
    rawTotalPositionCollateral: null,
    totalTokensOutstanding: null,
    liquidationLiveness: null,
    withdrawalLiveness: null,
    currentTime: null,
    isExpired: null,
    contractState: null,
    finderAddress: null,
    expiryPrice: null,
};



export const useEMPData = (empAddress: EthereumAddress) => {
    const [state, setState] = useState<ContractState>(initState);
    const { instance } = useEMPAt(empAddress)
    // const { block$ } = useWeb3Provider()
    const getAllEMPData = async (contractInstance) => {
        console.log("Contract instance", contractInstance)

        const res = await Promise.all([
            contractInstance.expirationTimestamp(),
            contractInstance.collateralCurrency(),
            contractInstance.priceIdentifier(),
            contractInstance.tokenCurrency(),
            contractInstance.collateralRequirement(),
            // contractInstance.disputeBondPercentage(),
            // contractInstance.disputerDisputeRewardPercentage(),
            // contractInstance.sponsorDisputeRewardPercentage(),
            contractInstance.minSponsorTokens(),
            contractInstance.timerAddress(),
            contractInstance.cumulativeFeeMultiplier(),
            contractInstance.rawTotalPositionCollateral(),
            contractInstance.totalTokensOutstanding(),
            contractInstance.liquidationLiveness(),
            contractInstance.withdrawalLiveness(),
            contractInstance.getCurrentTime(),
            contractInstance.contractState(),
            contractInstance.finder(),
            contractInstance.expiryPrice(),
        ]);
        console.log("pasaron todas las async calls")

        const newState: Partial<ContractState> = {
            expirationTimestamp: res[0] as BigNumber,
            collateralCurrency: res[1] as EthereumAddress,
            priceIdentifier: res[2] as Bytes,
            tokenCurrency: res[3] as EthereumAddress,
            collateralRequirement: res[4] as BigNumber,
            // disputeBondPct: res[5] as BigNumber,
            // disputerDisputeRewardPct: res[6] as BigNumber,
            // sponsorDisputeRewardPct: res[7] as BigNumber,
            minSponsorTokens: res[8] as BigNumber,
            timerAddress: res[9] as EthereumAddress,
            cumulativeFeeMultiplier: res[10] as BigNumber,
            rawTotalPositionCollateral: res[11] as BigNumber,
            totalTokensOutstanding: res[12] as BigNumber,
            liquidationLiveness: res[13] as BigNumber,
            withdrawalLiveness: res[14] as BigNumber,
            currentTime: res[15] as BigNumber,
            isExpired: Number(res[15]) >= Number(res[0]),
            contractState: Number(res[16]),
            finderAddress: res[17] as EthereumAddress,
            expiryPrice: res[18] as BigNumber,
        };
        console.log("New state", newState)
        return newState
    }

    useEffect(() => {
        if (instance) {
            console.log("Instance definida")
            getAllEMPData(instance)
                .then((result) => {
                    setState(result as any);
                })
                .catch((error) => {
                    console.log("Error on getAllEMPData", error)
                })
        }
    }, [instance]);

    // get state on each block
    // useEffect(() => {
    //     if (block$ && instance) {
    //         const sub = block$.subscribe(() => getAllEMPData(instance));
    //         return () => sub.unsubscribe();
    //     }
    // }, [block$, instance]);

    return { state }
}
