import { ethers } from "ethers"
import ExpiringMultiPartyArtifact from "@uma/core/build/contracts/ExpiringMultiParty.json"

import { EthereumAddress } from "../types"

import { useWeb3Provider } from "./useWeb3Provider"
import { useEffect, useState } from "react"

export const useEMPAt = (empAddress: EthereumAddress) => {
    const { signer } = useWeb3Provider()
    const [instance, setInstance] = useState<ethers.Contract | null>(null)

    useEffect(() => {
        if (signer) {
            const newInstance = new ethers.Contract(empAddress, ExpiringMultiPartyArtifact.abi, signer)
            setInstance(newInstance)
        }
    }, [signer])

    return {
        instance
    }
}

// export const useEMPContract = () => {
//     const instance = new ethers.Contract('ExpiringMultiParty', ExpiringMultiPartyArtifact.abi)
//     return instance
// }