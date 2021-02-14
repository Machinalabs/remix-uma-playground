import { useEffect, useState } from "react"
import { ethers } from "ethers"

import { EthereumAddress } from "../types"

import { useWeb3Provider } from "./useWeb3Provider"
import { useUMARegistry } from "./useUMARegistry"

export const useERC20At = (tokenAddress: EthereumAddress | undefined) => {
    const { signer } = useWeb3Provider()
    const { getContractInterface } = useUMARegistry()
    const [instance, setInstance] = useState<ethers.Contract | undefined>(undefined)

    useEffect(() => {
        if (signer && tokenAddress) {
            const newInstance = new ethers.Contract(tokenAddress, getContractInterface('ERC20'), signer)
            setInstance(newInstance)
        }
    }, [signer, tokenAddress])

    return {
        instance
    }
}
