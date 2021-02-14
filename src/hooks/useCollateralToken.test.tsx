import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { ethers } from 'ethers'

import { UMASnapshotContainer, delay, getInjectedProvider, PROVIDER_URL } from '../utils'
import { EthereumAddress } from '../types'

import { UMARegistryProvider } from './useUMARegistry'
import { ReactWeb3Provider } from './useWeb3Provider'
import { useCollateralToken } from './useCollateralToken'
import { deploySampleEMP } from './utils'

describe('useCollateralToken tests', () => {
    let empAddress: EthereumAddress
    let mongoContainerInstance: UMASnapshotContainer
    let injectedProvider: ethers.providers.Provider

    beforeAll(async () => {
        // mongoContainerInstance = new UMASnapshotContainer()
        // await mongoContainerInstance.init()
        // await mongoContainerInstance.start()
        // await delay(10000)

        injectedProvider = getInjectedProvider(PROVIDER_URL)
        const ethersJSProvider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
        const signer = ethersJSProvider.getSigner()

        // deploy token
        empAddress = await deploySampleEMP(signer)
    })

    const render = () => {
        const wrapper = ({ children }: any) => <UMARegistryProvider><ReactWeb3Provider injectedProvider={injectedProvider}>{children}</ReactWeb3Provider></UMARegistryProvider>
        const result = renderHook(() => useCollateralToken(empAddress), { wrapper })
        return result
    }

    test('properties are defined', async () => {
        const { result, waitForNextUpdate } = render()

        await waitForNextUpdate()

        await waitForNextUpdate()

        expect(result.current.name).toEqual('yUSD')
        expect(result.current.decimals).toEqual(18)
        expect(result.current.symbol).toEqual('yUSD')
    })

    // afterAll(async () => {
    //     await mongoContainerInstance.stop()
    // })
})