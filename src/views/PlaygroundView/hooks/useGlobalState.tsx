import { BigNumber, ethers } from "ethers"
import React, { PropsWithChildren, useContext, useEffect, useState } from "react"

import TestnetERC20Artifact from "@uma/core/build/contracts/TestnetERC20.json"
import AddressWhitelistArtifact from "@uma/core/build/contracts/AddressWhitelist.json"
import IdentifierWhitelistArtifact from "@uma/core/build/contracts/IdentifierWhitelist.json"
import ExpiringMultiPartyCreatorArtifact from "@uma/core/build/contracts/ExpiringMultiPartyCreator.json"

import { useRemix } from "../../../hooks"
import { Observable } from "rxjs"
import { debounceTime } from "rxjs/operators"
import { useUMARegistry } from "../../../hooks/useUMARegistry"
import { Block } from "../../../types"

export interface Token {
  name: string
  symbol: string
  decimals: number
  totalSupply: BigNumber
  address?: string
}

interface IGlobalStateProvider {
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
const GlobalStateContext = React.createContext<IGlobalStateProvider>({
  priceIdentifiers: ["ETH/BTC"],
  collateralTokens: [defaultCollateral],
  empAddresses: ["0x000000"],
  resetModalData: () => { },
  selectedPriceIdentifier: "",
  selectedCollateralToken: defaultToken,
  setSelectedCollateralToken: () => { },
  setSelectedPriceIdentifier: () => { },
  selectedEMPAddress: "0",
  setSelectedEMPAddress: (newEMP: string) => { },
})
/* tslint:enable */

export const GlobalStateProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const { web3Provider, signer } = useRemix()
  const [priceIdentifiers, setPriceIdentifiers] = useState<string[]>([])
  const [collateralTokens, setCollateralTokens] = useState<Token[]>([])
  const [empAddresses, setEmpAddresses] = useState<string[]>([])
  const [selectedPriceIdentifier, setSelectedPriceIdentifier] = useState<string>("")
  const [selectedCollateralToken, setSelectedCollateralToken] = useState<Token | undefined>(undefined)
  const [selectedEMPAddress, setSelectedEMPAddress] = useState<string>("0")

  const [empCreator$, setEMPCreator$] = useState<Observable<ethers.Contract> | null>(null)
  const [block$, setBlock$] = useState<Observable<Block> | null>(null)
  const { getContractAddress } = useUMARegistry()

  const resetModalData = () => {
    setSelectedPriceIdentifier("")
    setSelectedCollateralToken(undefined)
  }

  const getEMPAddresses = async () => {
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
    const events = await expiringMultipartyCreator.queryFilter(empCreatedFilter, 0, "latest")

    const newEmpAddresses = events.map((event) => {
      if (event.args) {
        return event.args[0]
      }
      return undefined
    })
    const empsFiltered: string[] = newEmpAddresses.filter((s) => s !== undefined) as string[]
    setEmpAddresses(empsFiltered)
  }

  const getCollateralTokens = async () => {
    const address = getContractAddress("AddressWhitelist")
    if (!address) {
      throw new Error("UMARegistryProvider not defined")
    }
    console.log("AddressWhitelist address", address)

    const erc20Interface = new ethers.utils.Interface(TestnetERC20Artifact.abi)
    const whitelistInterface = new ethers.utils.Interface(AddressWhitelistArtifact.abi)
    const whitelistContract = new ethers.Contract(address, whitelistInterface, signer)
    const addressesWhitelisted = await whitelistContract.getWhitelist()
    console.log("addressesWhitelisted", addressesWhitelisted)

    const promises = addressesWhitelisted.map(async (collateralAddressItem) => {
      const instance = new ethers.Contract(collateralAddressItem, erc20Interface, signer)
      return {
        name: await instance.name(),
        symbol: await instance.symbol(),
        decimals: await instance.decimals(),
        totalSupply: await instance.totalSupply(),
        address: collateralAddressItem,
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
    const identifierWhitelistContract = new ethers.Contract(address, identifierWhitelistInterface, signer)
    const supportedIdentifierFilter = await identifierWhitelistContract.filters.SupportedIdentifierAdded()
    const events = await identifierWhitelistContract.queryFilter(supportedIdentifierFilter, 0, "latest")
    const identifiers = events.map((event) => {
      if (event.args) {
        return ethers.utils.parseBytes32String(event.args[0])
      }
      return undefined
    })
    const identifiersFiltered: string[] = identifiers.filter((s) => s !== undefined) as string[]
    setPriceIdentifiers(identifiersFiltered)
  }

  useEffect(() => {
    console.log("Use contract")
    if (web3Provider && signer) {
      console.log("Web3 Provider Block Listener added")
      const observable = new Observable<Block>((subscriber) => {
        web3Provider.on("block", (blockNumber: number) => {
          web3Provider.getBlock(blockNumber).then((block) => subscriber.next(block))
        })
      })
      // debounce to prevent subscribers making unnecessary calls
      const blockInstance = observable.pipe(debounceTime(1000))
      setBlock$(blockInstance)

      // emp creator listener
      const expiringMultiPartyCreatorAddress = getContractAddress("ExpiringMultiPartyCreator")
      if (!expiringMultiPartyCreatorAddress) {
        throw new Error("UMARegistryProvider not defined")
      }

      // event CreatedExpiringMultiParty(address indexed expiringMultiPartyAddress, address indexed deployerAddress);
      const empCreatedFilter = {
        address: expiringMultiPartyCreatorAddress,
        topics: [ethers.utils.id("CreatedExpiringMultiParty(address,address)")],
      }
      const observableEMPCreator = new Observable<ethers.Contract>((subscriber) => {
        web3Provider.on(empCreatedFilter, (log, event) => {
          console.log("Event received EMP Created", log, event)
          subscriber.next(event)
        })
      })

      const empObservableInstance = observableEMPCreator.pipe(debounceTime(1000))
      setEMPCreator$(empObservableInstance)

      getCollateralTokens()
        .then(() => console.log("Collateral retrieved"))
        .catch((error) => console.log("Error getCollateralTokens", error))

      getPriceIdentifiers()
        .then(() => console.log("Price identifiers retrieved"))
        .catch((error) => console.log("Error getPriceIdentifiers", error))

      getEMPAddresses()
        .then(() => console.log("EMPs retrieved"))
        .catch((error) => console.log("Error getEMPs", error))
    }
  }, [web3Provider, signer]) // eslint-disable-line

  useEffect(() => {
    if (block$ && web3Provider && signer) {
      const sub = block$.subscribe(async () => {
        console.log("New block observable arrived")
        await getCollateralTokens()
        await getPriceIdentifiers()
        // await getEMPAddresses()
      })
      return () => sub.unsubscribe()
    }
  }, [block$]) // eslint-disable-line

  useEffect(() => {
    if (empCreator$ && web3Provider && signer) {
      const sub = empCreator$.subscribe(async () => {
        console.log("New EMP observable arrived")
        // await getCollateralTokens()
        // await getPriceIdentifiers()
        await getEMPAddresses()
      })
      return () => sub.unsubscribe()
    }
  }, [empCreator$]) // eslint-disable-line

  return (
    <GlobalStateContext.Provider
      value={{
        priceIdentifiers,
        collateralTokens,
        empAddresses,
        resetModalData,
        selectedPriceIdentifier,
        setSelectedPriceIdentifier,
        selectedCollateralToken,
        setSelectedCollateralToken,
        setSelectedEMPAddress,
        selectedEMPAddress,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  )
}

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext)

  if (context === null) {
    throw new Error(
      "useGlobalState() can only be used inside of <GlobalStateProvider />, please declare it at a higher level"
    )
  }
  return context
}
