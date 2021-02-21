import React from "react"
import { renderHook } from "@testing-library/react-hooks"
import { ethers } from "ethers"

import {
  UMASnapshotContainer,
  getInjectedProvider,
  PROVIDER_URL,
  startUMASnapshotContainerOrSkip,
  stopUMASnapshotContainerOrSkip,
} from "../utils"
import { EMPState, EthereumAddress } from "../types"

import { getUMAInterfaces, UMARegistryProvider } from "./useUMARegistry"
import { ReactWeb3Provider } from "./useWeb3Provider"
import { useCollateralToken } from "./useCollateralToken"
import { deploySampleEMP } from "./utils"
import { EMPProvider, getAllEMPData } from "./useEMPProvider"

describe("useCollateralToken tests", () => {
  let empAddress: EthereumAddress
  let umaSnapshotContainer: UMASnapshotContainer | undefined
  let injectedProvider: ethers.providers.Web3Provider
  let userAddress: EthereumAddress
  let empInstance: ethers.Contract
  let empData: EMPState

  beforeAll(async () => {
    umaSnapshotContainer = await startUMASnapshotContainerOrSkip()
    injectedProvider = new ethers.providers.Web3Provider(getInjectedProvider(PROVIDER_URL))
    const signer = injectedProvider.getSigner()
    userAddress = await signer.getAddress()

    // deploy sampleEMP
    empAddress = await deploySampleEMP(signer)

    const allInterfaces = getUMAInterfaces()
    empInstance = new ethers.Contract(
      empAddress,
      allInterfaces.get("ExpiringMultiParty") as ethers.utils.Interface,
      signer
    )
    empData = (await getAllEMPData(empInstance)) as EMPState
  })

  const render = () => {
    const wrapper = ({ children }: any) => (
      <UMARegistryProvider>
        <ReactWeb3Provider injectedProvider={injectedProvider}>{children}</ReactWeb3Provider>
      </UMARegistryProvider>
    )
    const result = renderHook(() => useCollateralToken(empAddress, userAddress, empData), { wrapper })
    return result
  }

  test("properties are defined", async () => {
    const { result, waitForNextUpdate } = render()

    await waitForNextUpdate()

    await waitForNextUpdate()

    expect(result.current).toBeDefined()
    expect(result.current!.name).toEqual("Wrapped Ether")
    expect(result.current!.decimals).toEqual(18)
    expect(result.current!.symbol).toEqual("WETH")
  })

  afterAll(async () => {
    await stopUMASnapshotContainerOrSkip(umaSnapshotContainer)
  })
})
