import { act, renderHook } from '@testing-library/react-hooks'
import { ethers } from 'ethers'
import React from 'react'
import { EthereumAddress } from '../types'

import { UMASnapshotContainer, delay, getInjectedProvider, PROVIDER_URL } from '../utils'

import { getUMAAddresses, getUMAInterfaces } from './useUMARegistry'
import { ReactWeb3Provider } from './useWeb3Provider'
import { buildFakeEMP } from './faker'
import { useGeneralInfo } from './useGeneralInfo'
import { deploySampleEMP } from './utils'

describe('useGeneralInfo tests', () => {
    let mongoContainerInstance: UMASnapshotContainer
    let injectedProvider: ethers.providers.Provider
    let empAddress: EthereumAddress

    beforeAll(async () => {
        // mongoContainerInstance = new UMASnapshotContainer()
        // await mongoContainerInstance.init()
        // await mongoContainerInstance.start()
        // await delay(10000)

        injectedProvider = getInjectedProvider(PROVIDER_URL)

        // deploy sample EMP
        const ethersJSProvider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
        const signer = ethersJSProvider.getSigner()
        empAddress = await deploySampleEMP(signer)
    })

    const render = () => {
        const wrapper = ({ children }: any) => <ReactWeb3Provider injectedProvider={injectedProvider}>{children}</ReactWeb3Provider>
        const result = renderHook(() => useGeneralInfo(empAddress), { wrapper })
        return result
    }

    test('properties are defined', async () => {
        const { result, waitForNextUpdate } = render()

        console.log("Result", result.current.expireDate)

        await waitForNextUpdate()

        expect(result.current.expireDate).toBeDefined()

        console.log("Result", result.current)
    })

    // afterAll(async () => {
    //     await mongoContainerInstance.stop()
    // })
})