import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";

import { EthereumAddress, NumberAsString } from "../types";

import { useEMPData } from "./useEMPData";
import { useERC20At } from "./useERC20At";

interface CollateralToken {
    symbol: string
    name: string
    decimals: NumberAsString
    balance: NumberAsString
    allowance: NumberAsString | "Infinity"
}

const fromWei = ethers.utils.formatUnits;

export const useCollateralToken = (empAddress: EthereumAddress, address: EthereumAddress): CollateralToken => {
    const { state: empState } = useEMPData(empAddress)
    const tokenAddress = empState.tokenCurrency;
    const { instance } = useERC20At(tokenAddress)

    const [symbol, setSymbol] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [decimals, setDecimals] = useState<NumberAsString>("");
    const [balance, setBalance] = useState<NumberAsString>("");
    const [allowance, setAllowance] = useState<NumberAsString | "Infinity">("");

    const getBalance = async (contractInstance: ethers.Contract, addressParam: EthereumAddress) => {
        const balanceRaw: BigNumber = await contractInstance.balanceOf(addressParam);
        const balance = fromWei(balanceRaw, decimals);
        return balance
    }

    const getAllowance = async (contractInstance: ethers.Contract, addressParam: EthereumAddress) => {
        const allowanceRaw: BigNumber = await contractInstance.allowance(
            addressParam,
            empAddress
        );
        const allowance = allowanceRaw.eq(ethers.constants.MaxUint256)
            ? "Infinity"
            : fromWei(allowanceRaw, decimals);

        return allowance
    }

    const getTokenInfo = async (contractInstance: ethers.Contract) => {
        const [symbol, name, decimals] = await Promise.all([
            contractInstance.symbol(),
            contractInstance.name(),
            contractInstance.decimals()
        ])
        setSymbol(symbol)
        setName(name)
        setDecimals(decimals)

        const [balance, allowance] = await Promise.all([
            getBalance(contractInstance, address),
            getAllowance(contractInstance, address)
        ])

        setBalance(balance)
        setAllowance(allowance)
    };

    useEffect(() => {
        if (instance) {
            setSymbol("");
            setName("");
            setDecimals("");
            setBalance("");
            setAllowance("");

            getTokenInfo(instance)
                .catch((error) => console.log("error getting token info", error))
        }
    }, [instance]);


    return {
        name,
        decimals,
        symbol,
        balance,
        allowance
    }
}