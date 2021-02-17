import { BigNumber, ethers } from "ethers"
import { formatUnits, parseBytes32String } from "ethers/lib/utils"
import { useEffect, useState } from "react"
import { fromWei } from "web3-utils"
import { DateAsString, EthereumAddress } from "../types"
import { useEMPData } from "./useEMPData"
import { useERC20At } from "./useERC20At"
import { useUMARegistry } from "./useUMARegistry"

interface SyntheticToken {
  symbol: string
  name: string
  decimals: number
  // balanceRaw: BigNumber
  // allowanceRaw: BigNumber
  // balance: string
  // allowance: string
}

export const useSyntheticToken = (empAddress: EthereumAddress): SyntheticToken => {
  const { state: empState } = useEMPData(empAddress)
  const tokenAddress = empState.tokenCurrency
  const { instance } = useERC20At(tokenAddress)

  const [symbol, setSymbol] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [decimals, setDecimals] = useState<number>(0)

  // TODO: Remove nulls
  const [allowance, setAllowance] = useState<number | "Infinity" | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [balanceBN, setBalanceBN] = useState<BigNumber | null>(null)

  const getTokenInfo = async (contractInstance: ethers.Contract) => {
    const [symbol, name, decimals] = await Promise.all([
      contractInstance.symbol(),
      contractInstance.name(),
      contractInstance.decimals(),
    ])
    // const balanceRaw: BigNumber = await contractInstance.balanceOf(address);
    // const allowanceRaw: BigNumber = await contractInstance.allowance(
    //     address, // probably has to be provider.getAccounts[0]
    //     empAddress
    // );

    // calculate readable balance and allowance
    // const balance = parseFloat(fromWei(balanceRaw, decimals));
    // const allowance = allowanceRaw.eq(ethers.constants.MaxUint256)
    //     ? "Infinity"
    //     : parseFloat(fromWei(allowanceRaw, decimals));

    // set states

    setSymbol(symbol)
    setName(name)
    setDecimals(decimals)
    // setBalance(balance);
    // setBalanceBN(balanceRaw);
    // setAllowance(allowance);
    // return {
    //     symbol,
    //     name,
    //     decimals
    // }
  }

  useEffect(() => {
    if (instance) {
      setSymbol("")
      setName("")
      setDecimals(0)

      setBalance(null)
      setBalanceBN(null)
      setAllowance(null)
      getTokenInfo(instance)
        // .then(({ symbol, name, decimals }) => {
        //     setSymbol(symbol);
        //     setName(name);
        //     setDecimals(decimals);
        // })
        .catch((error) => console.log("error getting token info", error))
    }
  }, [instance])

  return {
    name,
    decimals,
    symbol,
  }
}
