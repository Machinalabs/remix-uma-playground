import { ethers } from "ethers"
import React, { PropsWithChildren, useContext, useEffect, useState } from "react"

import { EthereumAddress, UMAContractName } from "../types"
import TestnetERC20Artifact from "@uma/core/build/contracts/TestnetERC20.json"
import ExpiringMultiPartyCreatorArtifact from "@uma/core/build/contracts/ExpiringMultiPartyCreator.json"
// import MockOracleArtifact from "@uma/core/build/contracts/MockOracle.json"
import FinderArtifact from "@uma/core/build/contracts/Finder.json"
import TimerArtifact from "@uma/core/build/contracts/Timer.json"
import VotingArtifact from "@uma/core/build/contracts/Voting.json"
import IdentifierWhitelistArtifact from "@uma/core/build/contracts/IdentifierWhitelist.json"
import VotingTokenArtifact from "@uma/core/build/contracts/VotingToken.json"
import RegistryArtifact from "@uma/core/build/contracts/Registry.json"
import FinancialContractAdminArtifact from "@uma/core/build/contracts/FinancialContractsAdmin.json"
import StoreArtifact from "@uma/core/build/contracts/Store.json"
import GovernorArtifact from "@uma/core/build/contracts/Governor.json"
import DesignatedVotingFactoryArtifact from "@uma/core/build/contracts/DesignatedVotingFactory.json"
import TokenFactoryArtifact from "@uma/core/build/contracts/TokenFactory.json"
import AddressWhitelistArtifact from "@uma/core/build/contracts/AddressWhitelist.json"
import ERC20Artifact from "@uma/core/build/contracts/ERC20.json"
import ExpiringMultiPartyArtifact from "@uma/core/build/contracts/ExpiringMultiParty.json"
import WETHArtifact from "@uma/core/build/contracts/WETH9.json"

interface IUMAProvider {
  getContractAddress: (contractName: UMAContractName) => EthereumAddress | undefined
  getContractInterface: (contractName: UMAContractName) => ethers.utils.Interface | undefined
}

const UMAContext = React.createContext<IUMAProvider>({
  getContractAddress: (contractName: UMAContractName) => {
    return undefined
  },
  getContractInterface: (contractName: UMAContractName) => {
    return undefined
  },
})

export const getUMAInterfaces = () => {
  const interfaces = new Map<UMAContractName, ethers.utils.Interface>()
  interfaces.set("Finder", new ethers.utils.Interface(FinderArtifact.abi))
  interfaces.set("Timer", new ethers.utils.Interface(TimerArtifact.abi))
  interfaces.set("VotingToken", new ethers.utils.Interface(VotingTokenArtifact.abi))
  interfaces.set("IdentifierWhitelist", new ethers.utils.Interface(IdentifierWhitelistArtifact.abi))
  interfaces.set("Voting", new ethers.utils.Interface(VotingArtifact.abi))
  interfaces.set("Registry", new ethers.utils.Interface(RegistryArtifact.abi))
  interfaces.set("FinancialContractAdmin", new ethers.utils.Interface(FinancialContractAdminArtifact.abi))
  interfaces.set("Store", new ethers.utils.Interface(StoreArtifact.abi))
  interfaces.set("Governor", new ethers.utils.Interface(GovernorArtifact.abi))
  interfaces.set("DesignatedVotingFactory", new ethers.utils.Interface(DesignatedVotingFactoryArtifact.abi))
  interfaces.set("TokenFactory", new ethers.utils.Interface(TokenFactoryArtifact.abi))
  interfaces.set("AddressWhitelist", new ethers.utils.Interface(AddressWhitelistArtifact.abi))
  interfaces.set("ExpiringMultiPartyCreator", new ethers.utils.Interface(ExpiringMultiPartyCreatorArtifact.abi))
  interfaces.set("ExpiringMultiParty", new ethers.utils.Interface(ExpiringMultiPartyArtifact.abi))
  interfaces.set("WETH", new ethers.utils.Interface(WETHArtifact.abi))
  interfaces.set("ERC20", new ethers.utils.Interface(ERC20Artifact.abi))
  interfaces.set("TestnetERC20", new ethers.utils.Interface(TestnetERC20Artifact.abi))
  return interfaces
}

export const getUMAAddresses = () => {
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
  addresses.set("WETH", "0xCF4FD87d243e028206fb823599725b52Cc528379")

  return addresses
}

export const UMARegistryProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [contracts, setContracts] = useState(new Map<UMAContractName, EthereumAddress>())
  const [interfaces, setInterfaces] = useState(new Map<UMAContractName, ethers.utils.Interface>())

  const getContractAddress = (contractName: UMAContractName) => {
    return contracts.get(contractName) as string
  }

  const getContractInterface = (contractName: UMAContractName) => {
    return interfaces.get(contractName) as ethers.utils.Interface
  }

  useEffect(() => {
    console.log("Use uma addresses")
    const umaAddresses = getUMAAddresses()
    setContracts(umaAddresses)

    const umaInterfaces = getUMAInterfaces()
    setInterfaces(umaInterfaces)
  }, [])

  return (
    <UMAContext.Provider
      value={{
        getContractAddress,
        getContractInterface,
      }}
    >
      {children}
    </UMAContext.Provider>
  )
}

export const useUMARegistry = () => {
  const context = useContext(UMAContext)

  if (context === null) {
    throw new Error(
      "useUMARegistry() can only be used inside of <UMARegistryProvider />, please declare it at a higher level"
    )
  }
  return context
}
