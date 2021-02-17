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
import { useGeneralInfo } from "./useGeneralInfo"
import { deploySampleEMP } from "./utils"

describe("useGeneralInfo tests", () => {
  let umaSnapshotContainer: UMASnapshotContainer | undefined
  let injectedProvider: ethers.providers.Web3Provider
  let empAddress: EthereumAddress

  beforeAll(async () => {
    umaSnapshotContainer = await startUMASnapshotContainerOrSkip()
    injectedProvider = new ethers.providers.Web3Provider(getInjectedProvider(PROVIDER_URL))
    const signer = injectedProvider.getSigner()

    // deploy sample EMP
    empAddress = await deploySampleEMP(signer)
  })

  const render = () => {
    const wrapper = ({ children }: any) => (
      <ReactWeb3Provider injectedProvider={injectedProvider}>{children}</ReactWeb3Provider>
    )
    const result = renderHook(() => useGeneralInfo(empAddress), { wrapper })
    return result
  }

  test("properties are defined", async () => {
    const { result, waitForNextUpdate } = render()

    console.log("Result", result.current.expireDate)

    await waitForNextUpdate()

    expect(result.current.expireDate).toBeDefined()

    console.log("Result", result.current)
  })

  afterAll(async () => {
    await stopUMASnapshotContainerOrSkip(umaSnapshotContainer)
  })
})
