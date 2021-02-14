import { act, renderHook } from '@testing-library/react-hooks'
import { ethers } from 'ethers'
import React from 'react'
import { EthereumAddress } from '../types'

import { UMASnapshotContainer, delay, getInjectedProvider, PROVIDER_URL } from '../utils'

import { getUMAAddresses, getUMAInterfaces } from './useUMARegistry'
import { ReactWeb3Provider } from './useWeb3Provider'
import { useDisputeParams } from './useDisputeParams'
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
        const ethersJSProvider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
        const signer = ethersJSProvider.getSigner()

        // create sample EMP
        empAddress = await deploySampleEMP(signer)
    })

    const render = () => {
        const wrapper = ({ children }: any) => <ReactWeb3Provider injectedProvider={injectedProvider}>{children}</ReactWeb3Provider>
        const result = renderHook(() => useDisputeParams(empAddress), { wrapper })
        return result
    }

    test('values are defined', async () => {
        const { result, waitForNextUpdate } = render()

        console.log("Result", result.current.liquidationLiveness)

        await waitForNextUpdate()

        expect(result.current.liquidationLiveness).toBeDefined()
        expect(result.current.withdrawalLiveness).toBeDefined()

        console.log("Result", result.current)
    })

    // afterAll(async () => {
    //     await mongoContainerInstance.stop()
    // })
})