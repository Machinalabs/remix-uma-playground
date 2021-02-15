import { useEffect, useState } from "react";
import { EthereumAddress, NumberAsString } from "../types";
import { BigNumber, BigNumberish, ethers } from "ethers";
import { useEMPData } from "./useEMPData";
import { useCollateralToken } from "./useCollateralToken";
import { useSyntheticToken } from "./useSyntheticToken";
import { useERC20At } from "./useERC20At";
import { useToken } from "./useToken";

interface Totals {
    totalCollateral: number | undefined
    totalSyntheticTokens: number | undefined
    gcr: number | undefined
}

const fromWei = ethers.utils.formatUnits;
const weiToNum = (x: BigNumberish, u = 18) => parseFloat(fromWei(x, u));

export const useTotals = (empAddress: EthereumAddress): Totals => {
    const { state: empState } = useEMPData(empAddress)
    const { decimals: collateralDecimals } = useToken(empState.collateralCurrency)
    const { decimals: syntheticDecimals } = useToken(empState.tokenCurrency)

    const [totalCollateral, setTotalCollateral] = useState<number | undefined>(undefined);
    const [totalTokens, setTotalTokens] = useState<number | undefined>(undefined);
    const [gcr, setGCR] = useState<number | undefined>(undefined);


    useEffect(() => {
        if (empState && collateralDecimals && syntheticDecimals) {
            const { cumulativeFeeMultiplier, rawTotalPositionCollateral, totalTokensOutstanding } = empState;

            if (cumulativeFeeMultiplier && totalTokensOutstanding && rawTotalPositionCollateral) {
                const totalCollateral = weiToNum(cumulativeFeeMultiplier) * weiToNum(rawTotalPositionCollateral, collateralDecimals);
                const totalTokens = weiToNum(totalTokensOutstanding, syntheticDecimals);
                const gcr = totalTokens > 0 ? totalCollateral / totalTokens : 0;

                setTotalCollateral(totalCollateral);
                setTotalTokens(totalTokens);
                setGCR(gcr);
            }
        } else {
            setTotalCollateral(0);
            setTotalTokens(0);
            setGCR(0);
        }
    }, [empState, collateralDecimals, syntheticDecimals])

    return {
        totalSyntheticTokens: totalTokens,
        totalCollateral,
        gcr
    }
}