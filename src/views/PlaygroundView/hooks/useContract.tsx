import { BigNumber, ethers } from "ethers"
import React, { PropsWithChildren, useContext, useEffect, useState } from "react"

import TestnetERC20Artifact from "@uma/core/build/contracts/TestnetERC20.json"
import AddressWhitelistArtifact from "@uma/core/build/contracts/AddressWhitelist.json"
import IdentifierWhitelistArtifact from "@uma/core/build/contracts/IdentifierWhitelist.json"
import ExpiringMultiPartyCreatorArtifact from "@uma/core/build/contracts/ExpiringMultiPartyCreator.json"

import { useRemix } from "../../../hooks"
import { Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { useUMARegistry } from "../../../hooks/useUMARegistry"
import { Block } from "../../../types"

export interface Token {
  name: string
  symbol: string
  decimals: number
  totalSupply: BigNumber
  address?: string
}

export interface ExpiringMultiParty {
  address: string
  expirationTimestamp: number
  syntheticName: string
  syntheticSymbol: string
  collateralRequirement: number
  minSponsorTokens: number
  withdrawalLiveness: number
  liquidationLiveness: number
}

export interface Position {
  syntheticTokens: BigNumber
  collateralAmount: BigNumber
}

interface IContractProvider {
  priceIdentifiers: string[]
  collateralTokens: Token[]
  empAddresses: string[]
  resetModalData: () => void
  setSelectedCollateralToken: (token?: Token) => void
  selectedCollateralToken?: Token
  setSelectedPriceIdentifier: (priceIdentifier: string) => void
  selectedPriceIdentifier: string
  selectedEMPAddress: string
  setSelectedEMPAddress: (newEMP: string) => void
}

const defaultToken: Token = { name: "SNT", symbol: "SNT", decimals: 18, totalSupply: BigNumber.from("10000000") }
const defaultCollateral: Token = { name: "WETH", symbol: "WETH", decimals: 18, totalSupply: BigNumber.from("10000000") }

/* tslint:disable */
// Defaults
const ContractContext = React.createContext<IContractProvider>({
  priceIdentifiers: ["ETH/BTC"],
  collateralTokens: [defaultCollateral],
  empAddresses: ["0x000000"],
  resetModalData: () => { },
  selectedPriceIdentifier: "",
  selectedCollateralToken: defaultToken,
  setSelectedCollateralToken: () => { },
  setSelectedPriceIdentifier: () => { },
  selectedEMPAddress: "0x000000",
  setSelectedEMPAddress: (newEMP: string) => { }
})
/* tslint:enable */

// const addContractAddress = (contractName: UMAContractName, address: EthereumAddress) => {
//     setContracts(new Map(contracts.set(contractName, address)))
// }

export const ContractProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const { web3Provider, signer } = useRemix()
  const [priceIdentifiers, setPriceIdentifiers] = useState<string[]>([])
  const [collateralTokens, setCollateralTokens] = useState<Token[]>([])
  const [empAddresses, setEmpAddresses] = useState<string[]>([])
  const [selectedPriceIdentifier, setSelectedPriceIdentifier] = useState<string>("")
  const [selectedCollateralToken, setSelectedCollateralToken] = useState<Token | undefined>(undefined)
  const [selectedEMPAddress, setSelectedEMPAddress] = useState<string>("")

  const [block$, setBlock$] = useState<Observable<Block> | null>(null);
  const { getContractAddress } = useUMARegistry()

  const resetModalData = () => {
    setSelectedPriceIdentifier("")
    setSelectedCollateralToken(undefined)
  }

  const getEMPs = async () => {
    const expiringMultipartyCreatorInterface = new ethers.utils.Interface(ExpiringMultiPartyCreatorArtifact.abi)
    const expiringMultiPartyCreatorAddress = getContractAddress("ExpiringMultiPartyCreator")
    if (!expiringMultiPartyCreatorAddress) {
      throw new Error("UMARegistryProvider not defined")
    }
    const expiringMultipartyCreator = new ethers.Contract(
      expiringMultiPartyCreatorAddress,
      expiringMultipartyCreatorInterface,
      signer
    )

    const empCreatedFilter = await expiringMultipartyCreator.filters.CreatedExpiringMultiParty()
    const events = await expiringMultipartyCreator.queryFilter(empCreatedFilter, 0, 'latest');

    const empAddresses = events.map((event) => {
      if (event.args) {
        return event.args[0]
      }
    })
    const identifiersFiltered: string[] = empAddresses.filter(s => s != undefined) as string[]
    setEmpAddresses(identifiersFiltered);
  }

  const getCollateralTokens = async () => {
    const address = getContractAddress("AddressWhitelist")
    if (!address) {
      throw new Error("UMARegistryProvider not defined")
    }
    console.log("address", address)

    const erc20Interface = new ethers.utils.Interface(TestnetERC20Artifact.abi)
    const whitelistInterface = new ethers.utils.Interface(AddressWhitelistArtifact.abi)
    const whitelistContract = new ethers.Contract(address, whitelistInterface, signer);
    const addressesWhitelisted = await whitelistContract.getWhitelist();
    console.log("addressesWhitelisted", addressesWhitelisted)

    const promises = addressesWhitelisted.map(async (collateralAddressItem) => {
      const instance = new ethers.Contract(collateralAddressItem, erc20Interface, signer)
      return {
        name: await instance.name(),
        symbol: await instance.symbol(),
        decimals: await instance.decimals(),
        totalSupply: await instance.totalSupply(),
        address: collateralAddressItem
      }
    })
    const result = await Promise.all(promises)
    setCollateralTokens(result as Token[])
  }

  const getPriceIdentifiers = async () => {
    const address = getContractAddress("IdentifierWhitelist")
    if (!address) {
      throw new Error("UMARegistryProvider not defined")
    }
    const identifierWhitelistInterface = new ethers.utils.Interface(IdentifierWhitelistArtifact.abi)
    const identifierWhitelistContract = new ethers.Contract(address, identifierWhitelistInterface, signer);
    const supportedIdentifierFilter = await identifierWhitelistContract.filters.SupportedIdentifierAdded()
    const events = await identifierWhitelistContract.queryFilter(supportedIdentifierFilter, 0, 'latest');
    const identifiers = events.map((event) => {
      if (event.args) {
        return ethers.utils.parseBytes32String(event.args[0])
      }
    })
    const identifiersFiltered: string[] = identifiers.filter(s => s != undefined) as string[]
    setPriceIdentifiers(identifiersFiltered);
  }

  useEffect(() => {
    console.log("Use contract")
    if (web3Provider && signer) {
      console.log("Web3 Provider Block Listener added")
      const observable = new Observable<Block>((subscriber) => {
        web3Provider.on("block", (blockNumber: number) => {
          web3Provider
            .getBlock(blockNumber)
            .then((block) => subscriber.next(block));
        });
      });
      // debounce to prevent subscribers making unnecessary calls
      const block$ = observable.pipe(debounceTime(1000));
      setBlock$(block$);

      console.log("Use contract middle")

      getCollateralTokens()
        .then(() => console.log("Collateral retrieved"))
        .catch((error) => console.log("Error getCollateralTokens", error))

      getPriceIdentifiers()
        .then(() => console.log("Price identifiers retrieved"))
        .catch((error) => console.log("Error getPriceIdentifiers", error))

      getEMPs()
        .then(() => console.log("EMPs retrieved"))
        .catch((error) => console.log("Error getEMPs", error))
    }
  }, [web3Provider, signer])

  useEffect(() => {
    if (block$ && web3Provider && signer) {
      const sub = block$.subscribe(async () => {
        console.log("New block observable arrived")
        await getCollateralTokens()
        await getPriceIdentifiers()
        await getEMPs()
      });
      return () => sub.unsubscribe();
    }
  }, [block$]);

  return (
    <ContractContext.Provider
      value={{
        priceIdentifiers,
        collateralTokens,
        empAddresses,
        resetModalData: resetModalData,
        selectedPriceIdentifier,
        setSelectedPriceIdentifier,
        selectedCollateralToken,
        setSelectedCollateralToken,
        setSelectedEMPAddress,
        selectedEMPAddress
      }}
    >
      {children}
    </ContractContext.Provider>
  )
}

export const useContract = () => {
  const context = useContext(ContractContext)

  if (context === null) {
    throw new Error(
      "useContract() can only be used inside of <ContractProvider />, please declare it at a higher level"
    )
  }
  return context
}
