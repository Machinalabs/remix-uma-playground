import { renderHook } from '@testing-library/react-hooks'
import { ethers } from 'ethers'
import React from 'react'

import { UMASnapshotContainer, delay, PROVIDER_URL, getInjectedProvider } from '../utils'

import { useWeb3Provider, ReactWeb3Provider } from './useWeb3Provider'

describe('useWeb3Provider tests', () => {

    let mongoContainerInstance: UMASnapshotContainer
    let injectedProvider: ethers.providers.Provider

    beforeAll(async () => {
        mongoContainerInstance = new UMASnapshotContainer()
        await mongoContainerInstance.init()
        await mongoContainerInstance.start()
        await delay(10000)

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
        await mongoContainerInstance.stop()
    })
})