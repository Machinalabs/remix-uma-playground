import { BigNumber, ethers } from "ethers"
import { useEffect, useState } from "react"
import { EMPState, EthereumAddress, TokenState } from "../types"
import { fromWei } from "../utils"
import { useERC20At } from "./useERC20At"
import { useWeb3Provider } from "./useWeb3Provider"

export const useSyntheticToken = (
  empAddress: EthereumAddress,
  address: EthereumAddress,
  empState?: EMPState
): TokenState | undefined => {
  // external
  const { block$ } = useWeb3Provider()
  const tokenAddress = empState ? empState.tokenCurrency : undefined
  const { instance } = useERC20At(tokenAddress)

  // state
  const [syntheticState, setSyntheticState] = useState<TokenState | undefined>(undefined)
  const getBalance = async (contractInstance: ethers.Contract, addressParam: EthereumAddress, newDecimals: number) => {
    const balanceRaw: BigNumber = await contractInstance.balanceOf(addressParam)
    const newBalance = fromWei(balanceRaw, newDecimals)
    return newBalance
  }

  const setMaxAllowance = async () => {
    if (instance) {
      const receipt = await instance.approve(empAddress, ethers.constants.MaxUint256)
      await receipt.wait()
      return receipt
    }
  }

  const getAllowance = async (
    contractInstance: ethers.Contract,
    addressParam: EthereumAddress,
    newDecimals: number
  ) => {
    const allowanceRaw: BigNumber = await contractInstance.allowance(addressParam, empAddress)
    const newAllowance = allowanceRaw.eq(ethers.constants.MaxUint256) ? "Infinity" : fromWei(allowanceRaw, newDecimals)

    return newAllowance
  }

  const getCollateralInfo = async (contractInstance: ethers.Contract) => {
    const [newSymbol, newName, newDecimals, newTotalSupply] = await Promise.all([
      contractInstance.symbol(),
      contractInstance.name(),
      contractInstance.decimals(),
      contractInstance.totalSupply(),
    ])

    const [newBalance, newAllowance] = await Promise.all([
      getBalance(contractInstance, address, newDecimals),
      getAllowance(contractInstance, address, newDecimals),
    ])

    setSyntheticState({
      symbol: newSymbol,
      name: newName,
      decimals: newDecimals,
      totalSupply: newTotalSupply,
      allowance: newAllowance,
      balance: newBalance,
      setMaxAllowance,
      instance: contractInstance,
    })
  }

  useEffect(() => {
    if (instance) {
      setSyntheticState(undefined)
      getCollateralInfo(instance).catch((error) => console.log("error getting token info", error))
    }
  }, [instance, address]) // eslint-disable-line

  // get collateral info on each new block
  useEffect(() => {
    if (block$ && instance) {
      const sub = block$.subscribe(() =>
        getCollateralInfo(instance).catch((error) => console.log("Error getCollateralInfo", error))
      )
      return () => sub.unsubscribe()
    }
  }, [block$, instance]) // eslint-disable-line

  return syntheticState
}
