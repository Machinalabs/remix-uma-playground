import React, { PropsWithChildren, useContext, useEffect, useState } from "react"

import { EthereumAddress, UMAContractName } from "../types"

interface IUMAProvider {
    getContractAddress: (contractName: UMAContractName) => EthereumAddress
}

const UMAContext = React.createContext<IUMAProvider>({
    getContractAddress: (contractName: UMAContractName) => { return "" },
})

export const UMARegistryProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [contracts, setContracts] = useState(new Map<UMAContractName, EthereumAddress>())

    const getContractAddress = (contractName: UMAContractName) => {
        return contracts.get(contractName) as string
    }

    // const addContractAddress = (contractName: UMAContractName, address: EthereumAddress) => {
    //     setContracts(new Map(contracts.set(contractName, address)))
    // }

    useEffect(() => {
        console.log("Use uma addresses")

        const addresses = new Map<UMAContractName, EthereumAddress>()
        addresses.set("Finder", "0x0CE79bD134ad8b1559e70315955FeBD0585Bd61c")
        addresses.set("Timer", "0xCbd9DA4C726C7e7Ab6A29B428B295799861cE0eD")
        addresses.set("VotingToken", "0x087183aF87b05C2AE914562826C5afBFc0E61a34")
        addresses.set("IdentifierWhitelist", "0xB02c41f1eB22fa5FfF384aB8Ff3109E79E0ff16d")
        addresses.set("Voting", "0xf0950a16020A237Ce05A3aEBD2916BAb43974a39")
        addresses.set("Registry", "0x42eCCE1cde42c25826E76A038DD3b58D9787BCdb")
        addresses.set("FinancialContractAdmin", "0xfd936B0581055e4De459a6aBB8f76336796edCEB")
        addresses.set("Store", "0x1D07EE6EE4cDEd89a8a693878808bc50BaDF5F60")
        addresses.set("Governor", "0x88a63D653C33C61C242C05d2681100478E1B278A")
        addresses.set("DesignatedVotingFactory", "0xA49203528D1C19a0163FAcEB1fc87Dd44DD3f5a0")
        addresses.set("TokenFactory", "0x514CF025Df0f69b306f14B921639881435783434")
        addresses.set("AddressWhitelist", "0xDFA95Ac05203120470a694e54cF983c4190642E7")
        addresses.set("ExpiringMultiPartyCreator", "0xA73c47D7619be70893ebf2E6d2d4401fcDE7aA26")
        setContracts(addresses)
    }, [])

    return (
        <UMAContext.Provider
            value={{
                getContractAddress
            }}
        >
            {children}
        </UMAContext.Provider>
    )
}

export const useUMARegistry = () => {
    const context = useContext(UMAContext)

    if (context === null) {
        throw new Error("useUMARegistry() can only be used inside of <UMARegistryProvider />, please declare it at a higher level")
    }
    return context
}