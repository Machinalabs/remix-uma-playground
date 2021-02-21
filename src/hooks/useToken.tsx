import { BigNumber, ethers } from "ethers"
import { useEffect, useState } from "react"
import { EthereumAddress } from "../types"
import { useERC20At } from "./useERC20At"

interface Token {
  symbol: string
  name: string
  decimals: number
  totalSupply: BigNumber | undefined
  // balanceRaw: BigNumber
  // allowanceRaw: BigNumber
  // balance: string
  // allowance: string
}

export const useToken = (tokenAddress?: EthereumAddress): Token => {
  const { instance } = useERC20At(tokenAddress)

  const [symbol, setSymbol] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [decimals, setDecimals] = useState<number>(0)
  const [totalSupply, setTotalSupply] = useState<BigNumber | undefined>(undefined)

  // TODO: Remove nulls
  const [allowance, setAllowance] = useState<number | "Infinity" | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [balanceBN, setBalanceBN] = useState<BigNumber | null>(null)

  const getTokenInfo = async (contractInstance: ethers.Contract) => {
    const [newSymbol, newName, newDecimals, newTotalSupply] = await Promise.all([
      contractInstance.symbol(),
      contractInstance.name(),
      contractInstance.decimals(),
      contractInstance.totalSupply(),
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

    setSymbol(newSymbol)
    setName(newName)
    setDecimals(newDecimals)
    setTotalSupply(newTotalSupply)
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
      setTotalSupply(undefined)

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
    totalSupply,
  }
}
