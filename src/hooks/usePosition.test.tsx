import { act, renderHook } from "@testing-library/react-hooks"
import { ethers } from "ethers"
import React from "react"
import { EthereumAddress } from "../types"

import {
  UMASnapshotContainer,
  getInjectedProvider,
  PROVIDER_URL,
  startUMASnapshotContainerOrSkip,
  stopUMASnapshotContainerOrSkip,
} from "../utils"

import { ReactWeb3Provider } from "./useWeb3Provider"
import { createPosition, deploySampleEMP } from "./utils"
import { usePosition } from "./usePosition"
import { EMPProvider } from "./useEMPProvider"
import { getUMAInterfaces, UMARegistryProvider } from "./useUMARegistry"

describe("usePosition tests", () => {
  let umaSnapshotContainer: UMASnapshotContainer | undefined
  let injectedProvider: ethers.providers.Web3Provider
  let empAddress: EthereumAddress
  let ownerAddress: EthereumAddress
  let empInstance: ethers.Contract

  beforeAll(async () => {
    umaSnapshotContainer = await startUMASnapshotContainerOrSkip()
    injectedProvider = new ethers.providers.Web3Provider(getInjectedProvider(PROVIDER_URL))
    const signer = injectedProvider.getSigner()
    ownerAddress = await signer.getAddress()

    const allInterfaces = getUMAInterfaces()

    // create sample EMP
    empAddress = await deploySampleEMP(signer)
    empInstance = new ethers.Contract(
      empAddress,
      allInterfaces.get("ExpiringMultiParty") as ethers.utils.Interface,
      signer
    )

    const collateralAmount = 200
    const syntheticTokens = 100

    // create a sample position
    await createPosition(empAddress, collateralAmount, syntheticTokens, signer)
  })

  const render = () => {
    const wrapper = ({ children }: any) => (
      <UMARegistryProvider>
        <ReactWeb3Provider injectedProvider={injectedProvider}>
          <EMPProvider empInstance={empInstance}>{children}</EMPProvider>
        </ReactWeb3Provider>
      </UMARegistryProvider>
    )
    const result = renderHook(() => usePosition(ownerAddress), { wrapper })
    return result
  }

  test("properties are defined", async () => {
    const { result, waitForNextUpdate } = render()

    await waitForNextUpdate()
    await waitForNextUpdate()
    await waitForNextUpdate()

    expect(result.current).toBeDefined()
    expect(result.current!.collateral).toBeDefined()

    console.log("Result", result.current)
  })

  afterAll(async () => {
    await stopUMASnapshotContainerOrSkip(umaSnapshotContainer)
  })
})
