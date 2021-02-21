import { BigNumber, ethers } from "ethers"
import { useEffect, useState } from "react"

import { EthereumAddress, PositionData } from "../types"
import { toNumberAsString, weiToNum } from "../utils"

import { useEMPProvider } from "./useEMPProvider"
import { useWeb3Provider } from "./useWeb3Provider"

export const usePosition = (address: EthereumAddress): PositionData | undefined => {
  const { block$ } = useWeb3Provider()
  const { collateralState, syntheticState, instance } = useEMPProvider()
  const [positionData, setPositionData] = useState<PositionData | undefined>(undefined)

  const getPositionInfo = async (
    contractInstance: ethers.Contract,
    collateralDecimals: number,
    syntheticDecimals: number
  ) => {
    const [collRawFixedPoint, position] = await Promise.all([
      contractInstance.getCollateral(address),
      contractInstance.positions(address),
      // contractInstance.getLiquidations(address),
    ])
    const collRaw: BigNumber = collRawFixedPoint[0]

    // Reformat data
    const tokensOutstanding: BigNumber = position.tokensOutstanding[0]
    const withdrawReqAmt: BigNumber = position.withdrawalRequestAmount[0]
    const withdrawReqPassTime: BigNumber = position.withdrawalRequestPassTimestamp
    const transferPositionRequestPassTimestamp: BigNumber = position.transferPositionRequestPassTimestamp
    const collateral: number = weiToNum(collRaw, collateralDecimals)
    const backingCollateral: number = weiToNum(collRaw.sub(withdrawReqAmt), collateralDecimals)
    const syntheticTokens: number = weiToNum(tokensOutstanding, syntheticDecimals)
    const collateralRatio = Number(syntheticTokens) > 0 ? Number(backingCollateral) / Number(syntheticTokens) : 0
    const withdrawalAmount: number = weiToNum(withdrawReqAmt, collateralDecimals)
    const withdrawalPassTime: number = withdrawReqPassTime.toNumber()
    const pendingWithdraw: string = withdrawReqPassTime.toString() !== "0" ? "Yes" : "No"
    const pendingTransfer: string = transferPositionRequestPassTimestamp.toString() !== "0" ? "Yes" : "No"

    setPositionData({
      syntheticTokens: toNumberAsString(syntheticTokens),
      collateral: toNumberAsString(collateral),
      collateralRatio: toNumberAsString(collateralRatio),
      backingCollateral: toNumberAsString(backingCollateral),
      withdrawalAmount: toNumberAsString(withdrawalAmount),
      withdrawalPassTime: toNumberAsString(withdrawalPassTime),
      pendingWithdraw,
      pendingTransfer,
    })
  }

  useEffect(() => {
    if (instance && collateralState && syntheticState) {
      const { decimals: collateralDecimals } = collateralState
      const { decimals: syntheticDecimals } = syntheticState

      getPositionInfo(instance, collateralDecimals, syntheticDecimals).catch((err) =>
        console.log("There was an error on getPositionInfo")
      )
    }
  }, [instance, collateralState, syntheticState, address]) // eslint-disable-line

  // get position info on each new block
  useEffect(() => {
    console.log("Calling block update on usePosition")
    if (block$ && instance && collateralState && syntheticState) {
      const { decimals: collateralDecimals } = collateralState
      const { decimals: syntheticDecimals } = syntheticState

      const sub = block$.subscribe(() =>
        getPositionInfo(instance, collateralDecimals, syntheticDecimals).catch((err) =>
          console.log("There was an error on getPositionInfo#block")
        )
      )
      return () => sub.unsubscribe()
    }
  }, [block$, instance, collateralState, syntheticState]) // eslint-disable-line

  return positionData
}
