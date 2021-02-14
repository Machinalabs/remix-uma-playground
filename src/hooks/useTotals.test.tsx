import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { ethers } from 'ethers'

import { EthereumAddress } from '../types'
import { UMASnapshotContainer, getInjectedProvider, PROVIDER_URL, startUMASnapshotContainerOrSkip, stopUMASnapshotContainerOrSkip } from '../utils'

import { ReactWeb3Provider } from './useWeb3Provider'
import { deploySampleEMP } from './utils'
import { useTotals } from './useTotals'
import { UMARegistryProvider } from './useUMARegistry'

describe('useTotals tests', () => {
    let umaSnapshotContainer: UMASnapshotContainer | undefined
    let injectedProvider: ethers.providers.Provider
    let empAddress: EthereumAddress

    beforeAll(async () => {
        umaSnapshotContainer = await startUMASnapshotContainerOrSkip()
        injectedProvider = getInjectedProvider(PROVIDER_URL)
        const ethersJSProvider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
        const signer = ethersJSProvider.getSigner()

        // create sample EMP
        empAddress = await deploySampleEMP(signer)
    })

    const render = () => {
        const wrapper = ({ children }: any) => <UMARegistryProvider><ReactWeb3Provider injectedProvider={injectedProvider}>{children}</ReactWeb3Provider></UMARegistryProvider>
        const result = renderHook(() => useTotals(empAddress), { wrapper })
        return result
    }

    test('values are defined', async () => {
        const { result, waitForNextUpdate } = render()

        await waitForNextUpdate()

        await waitForNextUpdate()

        await waitForNextUpdate()

        console.log("Result", result.current.totalCollateral)

        expect(result.current.gcr).toBeDefined()
        expect(result.current.totalCollateral).toBeDefined()
        expect(result.current.totalTokens).toBeDefined()

        console.log("Result", result.current)
    })

    afterAll(async () => {
        await stopUMASnapshotContainerOrSkip(umaSnapshotContainer)
    })
})