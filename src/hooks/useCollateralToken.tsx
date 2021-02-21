import { useEffect, useState } from "react"
import { BigNumber, ethers } from "ethers"

import { EMPState, EthereumAddress, TokenState } from "../types"

import { useERC20At } from "./useERC20At"
import { fromWei } from "../utils"
import { useWeb3Provider } from "./useWeb3Provider"

export const useCollateralToken = (empAddress: EthereumAddress, address: EthereumAddress, empState?: EMPState,): TokenState | undefined => {
  const { block$ } = useWeb3Provider()
  const tokenAddress = empState ? empState.collateralCurrency : undefined
  const { instance } = useERC20At(tokenAddress)
  const [collateralState, setCollateralState] = useState<TokenState | undefined>(undefined)

  console.log("Instance", instance, tokenAddress)

  const getBalance = async (contractInstance: ethers.Contract, addressParam: EthereumAddress, newDecimals: number) => {
    const balanceRaw: BigNumber = await contractInstance.balanceOf(addressParam)
    const newBalance = fromWei(balanceRaw, newDecimals)
    return newBalance
  }

  const setMaxAllowance = async () => {
    if (instance) {
      const receipt = await instance.approve(empAddress, ethers.constants.MaxUint256);
      await receipt.wait()
      return receipt;
    }
  };


  const getAllowance = async (contractInstance: ethers.Contract, addressParam: EthereumAddress, newDecimals: number) => {
    const allowanceRaw: BigNumber = await contractInstance.allowance(addressParam, empAddress)
    const newAllowance = allowanceRaw.eq(ethers.constants.MaxUint256) ? "Infinity" : fromWei(allowanceRaw, newDecimals)

    return newAllowance
  }

  const getCollateralInfo = async (contractInstance: ethers.Contract) => {
    const [newSymbol, newName, newDecimals, newTotalSupply] = await Promise.all([
      contractInstance.symbol(),
      contractInstance.name(),
      contractInstance.decimals(),
      contractInstance.totalSupply()
    ])
    console.log("decimals", newDecimals)
    // setSymbol(newSymbol)
    // setName(newName)
    // setDecimals(newDecimals)
    // setTotalSupply(newTotalSupply)

    // if (address) {
    console.log("Address", address)
    const [newBalance, newAllowance] = await Promise.all([
      getBalance(contractInstance, address, newDecimals),
      getAllowance(contractInstance, address, newDecimals),
    ])

    console.log("newBalance", newBalance)

    console.log("newAllowance", newAllowance)
    // setBalance(newBalance)
    // setAllowance(newAllowance)
    // }

    setCollateralState({
      symbol: newSymbol,
      name: newName,
      decimals: newDecimals,
      totalSupply: newTotalSupply,
      allowance: newAllowance,
      balance: newBalance,
      setMaxAllowance
    })
  }

  useEffect(() => {
    if (instance) {
      console.log("Calling useCollateral token")
      // setSymbol("")
      // setName("")
      // setDecimals(undefined)
      // setBalance("")
      // setAllowance("")
      // setTotalSupply(undefined)
      setCollateralState(undefined)
      getCollateralInfo(instance).catch((error) => console.log("error getting token info", error))
    }
  }, [instance, address])

  // get collateral info on each new block
  useEffect(() => {
    if (block$ && instance) {
      const sub = block$.subscribe(() => getCollateralInfo(instance).catch((error) => console.log("Error getCollateralInfo", error)));
      return () => sub.unsubscribe();
    }
  }, [block$, instance]);

  return collateralState;
  // name,
  // decimals,
  // symbol,
  // balance,
  // allowance,
  // totalSupply,
  // setMaxAllowance
  // collateralState
  // }
}
