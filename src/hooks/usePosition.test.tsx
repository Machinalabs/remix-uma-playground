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

describe("usePosition tests", () => {
  let umaSnapshotContainer: UMASnapshotContainer | undefined
  let injectedProvider: ethers.providers.Web3Provider
  let empAddress: EthereumAddress
  let ownerAddress: EthereumAddress

  beforeAll(async () => {
    umaSnapshotContainer = await startUMASnapshotContainerOrSkip()
    injectedProvider = new ethers.providers.Web3Provider(getInjectedProvider(PROVIDER_URL))
    const signer = injectedProvider.getSigner()
    ownerAddress = await signer.getAddress()

    // deploy sample EMP
    empAddress = await deploySampleEMP(signer)

    const collateralAmount = 200
    const syntheticTokens = 100

    // create a sample position
    await createPosition(empAddress, collateralAmount, syntheticTokens, signer)
  })

  const render = () => {
    const wrapper = ({ children }: any) => (
      <ReactWeb3Provider injectedProvider={injectedProvider}>{children}</ReactWeb3Provider>
    )
    const result = renderHook(() => usePosition(empAddress, ownerAddress), { wrapper })
    return result
  }

  test("properties are defined", async () => {
    const { result, waitForNextUpdate } = render()

    await waitForNextUpdate()

    expect(result.current.collateral).toBeDefined()

    console.log("Result", result.current)
  })

  afterAll(async () => {
    await stopUMASnapshotContainerOrSkip(umaSnapshotContainer)
  })
})
