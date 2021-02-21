import React from "react"
import { renderHook } from "@testing-library/react-hooks"
import { ethers } from "ethers"

import { EthereumAddress } from "../types"
import {
  UMASnapshotContainer,
  getInjectedProvider,
  PROVIDER_URL,
  startUMASnapshotContainerOrSkip,
  stopUMASnapshotContainerOrSkip,
} from "../utils"

import { ReactWeb3Provider } from "./useWeb3Provider"
import { deploySampleEMP } from "./utils"
import { useTotals } from "./useTotals"
import { EMPProvider } from "./useEMPProvider"
import { getUMAInterfaces, UMARegistryProvider } from "./useUMARegistry"

describe("useTotals tests", () => {
  let umaSnapshotContainer: UMASnapshotContainer | undefined
  let injectedProvider: ethers.providers.Web3Provider
  let empAddress: EthereumAddress
  let empInstance: ethers.Contract

  beforeAll(async () => {
    umaSnapshotContainer = await startUMASnapshotContainerOrSkip()
    injectedProvider = new ethers.providers.Web3Provider(getInjectedProvider(PROVIDER_URL))
    const signer = injectedProvider.getSigner()
    const allInterfaces = getUMAInterfaces()

    // create sample EMP
    empAddress = await deploySampleEMP(signer)
    empInstance = new ethers.Contract(
      empAddress,
      allInterfaces.get("ExpiringMultiParty") as ethers.utils.Interface,
      signer
    )
  })

  const render = () => {
    const wrapper = ({ children }: any) => (
      <UMARegistryProvider>
        <ReactWeb3Provider injectedProvider={injectedProvider}>
          <EMPProvider empInstance={empInstance}>{children}</EMPProvider>
        </ReactWeb3Provider>
      </UMARegistryProvider>
    )
    const result = renderHook(() => useTotals(), { wrapper })
    return result
  }

  test("values are defined", async () => {
    const { result, waitForNextUpdate } = render()

    await waitForNextUpdate()

    await waitForNextUpdate()

    await waitForNextUpdate()

    await waitForNextUpdate()

    expect(result.current!.gcr).toBeDefined()
    expect(result.current!.totalCollateral).toBeDefined()
    expect(result.current!.totalSyntheticTokens).toBeDefined()
  })

  afterAll(async () => {
    await stopUMASnapshotContainerOrSkip(umaSnapshotContainer)
  })
})
