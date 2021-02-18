import { BigNumber, ethers } from "ethers"
import { useEffect, useState } from "react"
import { EthereumAddress, NumberAsString } from "../types"
import { toNumberAsString, weiToNum } from "../utils"
import { useEMPAt } from "./useEMPAt"
import { useEMPData } from "./useEMPData"
import { useToken } from "./useToken"
import { useWeb3Provider } from "./useWeb3Provider"

interface PositionData {
  collateral: NumberAsString
  backingCollateral: NumberAsString
  syntheticTokens: NumberAsString
  collateralRatio: NumberAsString
  withdrawalAmount: NumberAsString
  withdrawalPassTime: NumberAsString
  pendingWithdraw: NumberAsString
  pendingTransfer: NumberAsString
}

export const usePosition = (empAddress: EthereumAddress, address: EthereumAddress): PositionData => {
  const { instance } = useEMPAt(empAddress)
  const { state: empState } = useEMPData(empAddress)
  const { decimals: collateralDecimals } = useToken(empState.collateralCurrency)
  const { decimals: syntheticTokenDecimals } = useToken(empState.tokenCurrency)
  const { block$ } = useWeb3Provider()

  // position data
  const [collateral, setCollateral] = useState<NumberAsString>("")
  const [backingCollateral, setBackingCollateral] = useState<NumberAsString>("")
  const [syntheticTokens, setSyntheticTokens] = useState<NumberAsString>("")
  const [collateralRatio, setCollateralRatio] = useState<NumberAsString>("")
  const [withdrawalAmount, setWithdrawalAmount] = useState<NumberAsString>("")
  const [withdrawalPassTime, setWithdrawalPassTime] = useState<NumberAsString>("")
  const [pendingWithdraw, setPendingWithdraw] = useState<NumberAsString>("")
  const [pendingTransfer, setPendingTransfer] = useState<NumberAsString>("")

  const getPositionInfo = async (contractInstance: ethers.Contract) => {
    // Make contract calls in parallel
    const [collRawFixedPoint, position, liquidations] = await Promise.all([
      contractInstance.getCollateral(address),
      contractInstance.positions(address),
      contractInstance.getLiquidations(address),
    ])
    const collRaw: BigNumber = collRawFixedPoint[0]

    // Reformat data
    const tokensOutstanding: BigNumber = position.tokensOutstanding[0]
    const withdrawReqAmt: BigNumber = position.withdrawalRequestAmount[0]
    const withdrawReqPassTime: BigNumber = position.withdrawalRequestPassTimestamp
    const transferPositionRequestPassTimestamp: BigNumber = position.transferPositionRequestPassTimestamp
    const newCollateral: number = weiToNum(collRaw, collateralDecimals)
    const newBackingCollateral: number = weiToNum(collRaw.sub(withdrawReqAmt), collateralDecimals)
    const tokens: number = weiToNum(tokensOutstanding, syntheticTokenDecimals)
    const cRatio = Number(tokens) > 0 ? Number(backingCollateral) / Number(tokens) : 0
    const newWithdrawalAmount: number = weiToNum(withdrawReqAmt, collateralDecimals)
    const withdrawPassTime: number = withdrawReqPassTime.toNumber()
    const newPendingWithdraw: string = withdrawReqPassTime.toString() !== "0" ? "Yes" : "No"
    const newPendingTransfer: string = transferPositionRequestPassTimestamp.toString() !== "0" ? "Yes" : "No"

    setCollateral(toNumberAsString(newCollateral))
    setBackingCollateral(toNumberAsString(newBackingCollateral))
    setSyntheticTokens(toNumberAsString(tokens))
    setCollateralRatio(toNumberAsString(cRatio))
    setWithdrawalAmount(toNumberAsString(newWithdrawalAmount))
    setWithdrawalPassTime(toNumberAsString(withdrawPassTime))
    setPendingWithdraw(newPendingWithdraw)
    setPendingTransfer(newPendingTransfer)
  }

  useEffect(() => {
    if (instance) {
      setCollateral("")
      setBackingCollateral("")
      setSyntheticTokens("")
      setCollateralRatio("")
      setWithdrawalAmount("")
      setWithdrawalPassTime("")
      setPendingWithdraw("")
      setPendingTransfer("")

      getPositionInfo(instance).catch(() => console.log("There was an error on getPositionInfo"))
    }
  }, [instance, address])

  // get position info on each new block
  useEffect(() => {
    if (block$ && instance) {
      const sub = block$.subscribe(() => getPositionInfo(instance))
      return () => sub.unsubscribe()
    }
  }, [block$, instance])

  return {
    collateral,
    backingCollateral,
    syntheticTokens,
    collateralRatio,
    withdrawalAmount,
    withdrawalPassTime,
    pendingWithdraw,
    pendingTransfer,
  }
}
