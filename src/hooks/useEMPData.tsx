import { useEffect, useState } from "react"
import { BigNumber, Bytes } from "ethers"

import { EthereumAddress } from "../types"

import { useWeb3Provider } from "./useWeb3Provider"
import { useEMPAt } from "./useEMPAt"

interface ContractState {
  // TODO: Remove
  expirationTimestamp: BigNumber | undefined
  collateralCurrency: string | undefined
  priceIdentifier: Bytes | undefined
  tokenCurrency: string | undefined
  collateralRequirement: BigNumber | undefined
  disputeBondPct: BigNumber | undefined
  disputerDisputeRewardPct: BigNumber | undefined
  sponsorDisputeRewardPct: BigNumber | undefined
  minSponsorTokens: BigNumber | undefined
  timerAddress: string | undefined
  cumulativeFeeMultiplier: BigNumber | undefined
  rawTotalPositionCollateral: BigNumber | undefined
  totalTokensOutstanding: BigNumber | undefined
  liquidationLiveness: BigNumber | undefined
  withdrawalLiveness: BigNumber | undefined
  currentTime: BigNumber | undefined
  isExpired: boolean | undefined
  contractState: number | undefined
  finderAddress: string | undefined
  expiryPrice: BigNumber | undefined
}

const initState = {
  expirationTimestamp: undefined,
  collateralCurrency: undefined,
  priceIdentifier: undefined,
  tokenCurrency: undefined,
  collateralRequirement: undefined,
  disputeBondPct: undefined,
  disputerDisputeRewardPct: undefined,
  sponsorDisputeRewardPct: undefined,
  minSponsorTokens: undefined,
  timerAddress: undefined,
  cumulativeFeeMultiplier: undefined,
  rawTotalPositionCollateral: undefined,
  totalTokensOutstanding: undefined,
  liquidationLiveness: undefined,
  withdrawalLiveness: undefined,
  currentTime: undefined,
  isExpired: undefined,
  contractState: undefined,
  finderAddress: undefined,
  expiryPrice: undefined,
}

export const useEMPData = (empAddress: EthereumAddress) => {
  const [state, setState] = useState<ContractState>(initState)
  const { instance } = useEMPAt(empAddress)
  const { block$ } = useWeb3Provider()

  console.log("Calling useEMPData")
  const getAllEMPData = async (contractInstance) => {
    const res = await Promise.all([
      contractInstance.expirationTimestamp(),
      contractInstance.collateralCurrency(),
      contractInstance.priceIdentifier(),
      contractInstance.tokenCurrency(),
      contractInstance.collateralRequirement(),
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
      // contractInstance.disputeBondPercentage(),
      // contractInstance.disputerDisputeRewardPercentage(),
      // contractInstance.sponsorDisputeRewardPercentage(),
    ])
    // console.log("pasaron todas las async calls")

    const newState: Partial<ContractState> = {
      expirationTimestamp: res[0] as BigNumber,
      collateralCurrency: res[1] as EthereumAddress,
      priceIdentifier: res[2] as Bytes,
      tokenCurrency: res[3] as EthereumAddress,
      collateralRequirement: res[4] as BigNumber,
      minSponsorTokens: res[5] as BigNumber,
      timerAddress: res[6] as EthereumAddress,
      cumulativeFeeMultiplier: res[7] as BigNumber,
      rawTotalPositionCollateral: res[8] as BigNumber,
      totalTokensOutstanding: res[9] as BigNumber,
      liquidationLiveness: res[10] as BigNumber,
      withdrawalLiveness: res[11] as BigNumber,
      currentTime: res[12] as BigNumber,
      isExpired: Number(res[13]) >= Number(res[0]),
      contractState: Number(res[14]),
      finderAddress: res[15] as EthereumAddress,
      expiryPrice: res[16] as BigNumber,
      // disputeBondPct: res[17] as BigNumber,
      // disputerDisputeRewardPct: res[18] as BigNumber,
      // sponsorDisputeRewardPct: res[19] as BigNumber,
    }
    // console.log("New state", newState)
    return newState
  }

  useEffect(() => {
    if (instance) {
      getAllEMPData(instance)
        .then((result) => {
          setState(result as any)
        })
        .catch((error) => {
          console.log("Error on getAllEMPData", error)
        })
    } else {
      setState(initState)
    }
  }, [instance])

  // get state on each block
  useEffect(() => {
    if (block$ && instance) {
      const sub = block$.subscribe(() => getAllEMPData(instance))
      return () => sub.unsubscribe()
    }
  }, [block$, instance])

  return { state }
}
