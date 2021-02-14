import { renderHook } from '@testing-library/react-hooks'
import { ethers } from 'ethers'
import React from 'react'

import { UMASnapshotContainer, PROVIDER_URL, getInjectedProvider, startUMASnapshotContainerOrSkip, stopUMASnapshotContainerOrSkip } from '../utils'

import { useWeb3Provider, ReactWeb3Provider } from './useWeb3Provider'

describe('useWeb3Provider tests', () => {

    let umaSnapshotContainer: UMASnapshotContainer | undefined
    let injectedProvider: ethers.providers.Provider

    beforeAll(async () => {
        umaSnapshotContainer = await startUMASnapshotContainerOrSkip()
        injectedProvider = getInjectedProvider(PROVIDER_URL)
    })

    const render = () => {
        const wrapper = ({ children }: any) => <ReactWeb3Provider injectedProvider={injectedProvider}>{children}</ReactWeb3Provider>
        const { result } = renderHook(() => useWeb3Provider(), { wrapper })
        return {
            result,
        }
    }

    test('provider', () => {
        const { result } = render()

        expect(result.current.provider).toBeDefined()
    })

    test('signer', () => {
        const { result } = render()

        expect(result.current.signer).toBeDefined()
    })

    test('observable block', () => {
        const { result } = render()

        expect(result.current.block$).toBeDefined()
    })

    afterAll(async () => {
        await stopUMASnapshotContainerOrSkip(umaSnapshotContainer)
    })
})