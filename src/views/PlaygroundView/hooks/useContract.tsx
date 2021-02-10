import { BigNumber, ethers } from "ethers"
import React, { PropsWithChildren, useContext, useEffect, useState } from "react"

import TestnetERC20Artifact from "@uma/core/build/contracts/TestnetERC20.json"
import ExpandedERC20Artifact from "@uma/core/build/contracts/ExpandedERC20.json"
import AddressWhitelistArtifact from "@uma/core/build/contracts/AddressWhitelist.json"
import ExpiringMultiPartyArtifact from "@uma/core/build/contracts/ExpiringMultiParty.json"
import IdentifierWhitelistArtifact from "@uma/core/build/contracts/IdentifierWhitelist.json"
import ExpiringMultiPartyCreatorArtifact from "@uma/core/build/contracts/ExpiringMultiPartyCreator.json"

import { formatUnits } from "ethers/lib/utils"
import { useRemix } from "../../../hooks"
import { Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { useUMAAddresses } from "../../../hooks/useUmaAddresses"

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
  // setContracts: (contractsMap: Map<UMAContractName, EthereumAddress>) => void
  // getContractAddress: (contractName: UMAContractName) => string
  // addContractAddress: (contractName: UMAContractName, address: EthereumAddress) => void
  // contracts: Map<UMAContractName, EthereumAddress>
  priceIdentifiers: string[]
  collateralTokens: Token[]
  empAddresses: string[]

  // syntheticTokens: Token[]
  // addSyntheticToken: (newToken: Token) => Token[]
  resetModalData: () => void
  // collateralBalance: string
  // syntheticBalance: string
  // updateBalances: (signer: any, account: string) => Promise<void>
  // expiringMultiParties: ExpiringMultiParty[]
  // addExpiringMultiParty: (newEMP: ExpiringMultiParty) => void
  // positions: Position[]
  // addPosition: (newPosition: Position) => void
  // updateSyntheticTotalSupply: (signer: any) => Promise<void>
  // updatePositions: (signer: any, account: string) => Promise<void>
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
  // syntheticTokens: [defaultToken],
  empAddresses: ["0x000000"],
  // addSyntheticToken: (newToken: Token) => [
  //   defaultToken
  // ],
  resetModalData: () => { },
  // collateralBalance: "0",
  // syntheticBalance: "0",
  // updateBalances: (signer: any, account: string) => {
  //   return Promise.resolve()
  // },
  // expiringMultiParties: [],
  // addExpiringMultiParty: (newEMP: ExpiringMultiParty) => { },
  // positions: [],
  // addPosition: (newPosition: Position) => { },
  // updateSyntheticTotalSupply: (signer: any) => {
  //   return Promise.resolve()
  // },
  // updatePositions: (signer: any, account: string) => {
  //   return Promise.resolve()
  // },
  selectedPriceIdentifier: "",
  selectedCollateralToken: defaultToken,
  setSelectedCollateralToken: () => { },
  setSelectedPriceIdentifier: () => { },
  selectedEMPAddress: "0x000000",
  setSelectedEMPAddress: (newEMP: string) => { }
})
/* tslint:enable */

type Block = ethers.providers.Block;

export const ContractProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const { web3Provider, signer } = useRemix()
  const [priceIdentifiers, setPriceIdentifiers] = useState<string[]>([])
  const [collateralTokens, setCollateralTokens] = useState<Token[]>([])
  const [empAddresses, setEmpAddresses] = useState<string[]>([])

  const [expiringMultiParties, setExpiringMultiParties] = useState<ExpiringMultiParty[]>([])

  const [syntheticTokens, setSyntheticTokens] = useState<Token[]>([])
  const [collateralBalance, setCollateralBalance] = useState("0")
  const [syntheticBalance, setSyntheticBalance] = useState("0")
  const [positions, setPositions] = useState<Position[]>([])
  const [selectedPriceIdentifier, setSelectedPriceIdentifier] = useState<string>("")
  const [selectedCollateralToken, setSelectedCollateralToken] = useState<Token | undefined>(undefined)
  const [selectedEMPAddress, setSelectedEMPAddress] = useState<string>("")

  const [block$, setBlock$] = useState<Observable<Block> | null>(null);
  const { getContractAddress } = useUMAAddresses()

  const addSyntheticToken = (newToken: Token) => {
    const newItems = [...syntheticTokens, newToken]
    setSyntheticTokens(newItems)
    return newItems
  }

  // TO analyse...
  const resetModalData = () => {
    // const resetedCollateralToken = []
    // setCollateralTokens(resetedCollateralToken)

    // const resetedPriceIdentifiers = []
    // setPriceIdentifiers(resetedPriceIdentifiers)

    // setCollateralBalance("0")
    // setSyntheticBalance("0")
    // addContractAddress("TestnetErc20Address", "")
    // addContractAddress("SynthethicToken", "")

    // const resetedPositions = []
    // setPositions(resetedPositions)

    // const resetedEMPs = []
    // setExpiringMultiParties(resetedEMPs)

    // const resetSynths = []
    // setSyntheticTokens(resetSynths)

    setSelectedPriceIdentifier("")
    setSelectedCollateralToken(undefined)
  }

  const updateBalances = async (signer: any, account: string) => {
    const testnetERC20Contract = new ethers.Contract(
      getContractAddress("TestnetErc20Address"),
      TestnetERC20Artifact.abi,
      signer
    )
    const balance: BigNumber = await testnetERC20Contract.balanceOf(account)

    setCollateralBalance(`${formatUnits(balance, "ether").toString()}`)
    console.log("Balance", balance)

    if (getContractAddress("SynthethicToken")) {
      const syntheticContract = new ethers.Contract(
        getContractAddress("SynthethicToken"),
        ExpandedERC20Artifact.abi,
        signer
      )
      const syntbalance: BigNumber = await syntheticContract.balanceOf(account)
      setSyntheticBalance(`${formatUnits(syntbalance, "ether").toString()}`)
      console.log("syntbalance", syntbalance)
    }
  }

  // const addContractAddress = (contractName: UMAContractName, address: EthereumAddress) => {
  //   setContracts(new Map(contracts.set(contractName, address)))
  // }

  const updateSyntheticTotalSupply = async (signer: any) => {
    const newSynthsWithBalancesUpdated = syntheticTokens.map(async (item) => {
      const currentItem = item
      if (currentItem.address) {
        const contractInstance = new ethers.Contract(currentItem.address, ExpandedERC20Artifact.abi, signer)
        const totalSupply = await contractInstance.totalSupply()
        return {
          ...item,
          totalSupply,
        }
      }
      return item
    })
    console.log("await Promise.all(newSynthsWithBalancesUpdated)", await Promise.all(newSynthsWithBalancesUpdated))
    setSyntheticTokens(await Promise.all(newSynthsWithBalancesUpdated))
  }

  // const addExpiringMultiParty = (newItem: ExpiringMultiParty) => {
  //   const newItems = [...expiringMultiParties, newItem]
  //   setExpiringMultiParties(newItems)
  //   return newItems
  // }

  // const addPosition = (newItem: Position) => {
  //   const newItems = [...positions, newItem]
  //   setPositions(newItems)
  //   return newItems
  // }

  const getEMPs = async () => {
    // CreatedExpiringMultiParty
    const expiringMultipartyCreatorInterface = new ethers.utils.Interface(ExpiringMultiPartyCreatorArtifact.abi)

    const expiringMultiPartyCreatorAddress = getContractAddress("ExpiringMultiPartyCreator")
    const expiringMultipartyCreator = new ethers.Contract(
      expiringMultiPartyCreatorAddress,
      expiringMultipartyCreatorInterface,
      signer
    )

    const empCreatedFilter = await expiringMultipartyCreator.filters.CreatedExpiringMultiParty()

    const events = await expiringMultipartyCreator.queryFilter(empCreatedFilter, 0, 'latest');
    console.log("events", events)

    const empAddresses = events.map((event) => {
      if (event.args) {
        return event.args[0]
      }
    })
    console.log("identifiers", empAddresses)
    const identifiersFiltered: string[] = empAddresses.filter(s => s != undefined) as string[]
    setEmpAddresses(identifiersFiltered);
  }

  const updatePositions = async (signer: any, account: string) => {
    const contractInstance = new ethers.Contract(
      getContractAddress("ExpiringMultiParty"),
      ExpiringMultiPartyArtifact.abi,
      signer
    )

    const position = await contractInstance.positions(account)

    const newPositionsUpdated: Position = {
      syntheticTokens: position.tokensOutstanding,
      collateralAmount: position.rawCollateral,
    }
    setPositions([newPositionsUpdated])
  }

  const getCollateralTokens = async () => {
    const address = getContractAddress("AddressWhitelist")
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
    console.log("result", result)
    setCollateralTokens(result as Token[])
  }

  const getPriceIdentifiers = async () => {
    const address = getContractAddress("IdentifierWhitelist")
    const identifierWhitelistInterface = new ethers.utils.Interface(IdentifierWhitelistArtifact.abi)
    const identifierWhitelistContract = new ethers.Contract(address, identifierWhitelistInterface, signer);
    const supportedIdentifierFilter = await identifierWhitelistContract.filters.SupportedIdentifierAdded()
    const events = await identifierWhitelistContract.queryFilter(supportedIdentifierFilter, 0, 'latest');
    const identifiers = events.map((event) => {
      if (event.args) {
        return ethers.utils.parseBytes32String(event.args[0])
      }
    })
    console.log("identifiers", identifiers)
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
  }, [])

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
        // collateralBalance,
        // syntheticBalance,
        // updateBalances,
        // // addContractAddress,
        // // addExpiringMultiParty,
        // // addPosition,
        // positions,
        // expiringMultiParties,
        // // updateSyntheticTotalSupply,
        // // updatePositions,
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
