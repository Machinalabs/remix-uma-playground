import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { ethers } from 'ethers'
import { EthereumAddress } from '../types'

import { UMASnapshotContainer, delay, getInjectedProvider, PROVIDER_URL } from '../utils'

import { useEMPData } from './useEMPData'
import { ReactWeb3Provider } from './useWeb3Provider'
import { deploySampleEMP } from './utils'

describe('useEMPData tests', () => {
    let mongoContainerInstance: UMASnapshotContainer
    let injectedProvider: ethers.providers.Provider
    let empAddress: EthereumAddress

    beforeAll(async () => {
        mongoContainerInstance = new UMASnapshotContainer()
        await mongoContainerInstance.init()
        await mongoContainerInstance.start()
        await delay(10000)

        injectedProvider = getInjectedProvider(PROVIDER_URL)
        const ethersJSProvider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
        const signer = ethersJSProvider.getSigner()

        // create sample EMP
        empAddress = await deploySampleEMP(signer)
    })

    const render = () => {
        const wrapper = ({ children }: any) => <ReactWeb3Provider injectedProvider={injectedProvider}>{children}</ReactWeb3Provider>
        const result = renderHook(() => useEMPData(empAddress), { wrapper })
        return result
    }

    test('provider', async () => {
        const { result, waitForNextUpdate } = render()

        console.log("Result", result.current.state)

        await waitForNextUpdate()

        expect(result.current.state).toBeDefined()

        console.log("Result", result.current.state)
    })

    // afterAll(async () => {
    //     await mongoContainerInstance.stop()
    // })
})