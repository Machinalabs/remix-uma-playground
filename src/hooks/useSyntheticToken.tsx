import { BigNumber, ContractReceipt, ethers } from "ethers"
import { useEffect, useState } from "react"
import { EthereumAddress, NumberAsString } from "../types"
import { fromWei } from "../utils"
import { useEMPProvider } from "./useEMPProvider"
import { useERC20At } from "./useERC20At"

interface SyntheticToken {
  symbol: string
  name: string
  decimals: number | undefined
  balance: NumberAsString
  allowance: NumberAsString | "Infinity"
  totalSupply: BigNumber | undefined
  setMaxAllowance: () => Promise<ContractReceipt>
}

export const useSyntheticToken = (empAddress: EthereumAddress, address?: EthereumAddress): SyntheticToken => {
  const { empState } = useEMPProvider()
  const tokenAddress = empState ? empState.tokenCurrency : undefined

  // const tokenAddress = empState.tokenCurrency
  const { instance } = useERC20At(tokenAddress)

  const [symbol, setSymbol] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [decimals, setDecimals] = useState<number | undefined>(undefined)
  const [balance, setBalance] = useState<NumberAsString>("")
  const [allowance, setAllowance] = useState<NumberAsString | "Infinity">("")
  const [totalSupply, setTotalSupply] = useState<BigNumber | undefined>(undefined);

  const getBalance = async (contractInstance: ethers.Contract, addressParam: EthereumAddress, newDecimals: number) => {
    const balanceRaw: BigNumber = await contractInstance.balanceOf(addressParam)
    console.log("balanceRaw", balanceRaw)
    console.log("decimals", decimals)

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

  const getTokenInfo = async (contractInstance: ethers.Contract) => {
    const [newSymbol, newName, newDecimals, newTotalSupply] = await Promise.all([
      contractInstance.symbol(),
      contractInstance.name(),
      contractInstance.decimals(),
      contractInstance.totalSupply()
    ])
    console.log("decimals", newDecimals)
    setSymbol(newSymbol)
    setName(newName)
    setDecimals(newDecimals)
    setTotalSupply(newTotalSupply)

    console.log("getTokenInfo", address)
    if (address) {
      const [newBalance, newAllowance] = await Promise.all([
        getBalance(contractInstance, address, newDecimals),
        getAllowance(contractInstance, address, newDecimals),
      ])

      console.log("newBalance", newBalance)

      console.log("newAllowance", newAllowance)
      setBalance(newBalance)
      setAllowance(newAllowance)
    }
  }

  useEffect(() => {
    if (instance) {
      console.log("Calling useSynthetic token")
      setSymbol("")
      setName("")
      setDecimals(undefined)
      setBalance("")
      setAllowance("")
      setTotalSupply(undefined)
      getTokenInfo(instance).catch((error) => console.log("error getting token info", error))
    }
  }, [instance, address])

  return {
    name,
    decimals,
    symbol,
    balance,
    allowance,
    totalSupply,
    setMaxAllowance
  }
}