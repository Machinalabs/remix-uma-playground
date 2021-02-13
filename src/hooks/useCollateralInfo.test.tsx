import { act, renderHook } from '@testing-library/react-hooks'
import { ethers } from 'ethers'
import React from 'react'
import { EthereumAddress } from '../types'

import { UMASnapshotContainer, delay, CONTAINER_PORT } from '../utils'

import { getUMAAddresses, getUMAInterfaces } from './useUMARegistry'
import { ReactWeb3Provider } from './useWeb3Provider'
import { buildFakeEMP } from './faker'
import { useCollateralInfo } from './useCollateralInfo'
import { deploySampleEMP } from './utils'

jest.setTimeout(30000)

const http = require('http');
const Web3HttpProvider = require('web3-providers-http');

const options = {
    keepAlive: true,
    timeout: 2000, // milliseconds,
    withCredentials: false,
    headers: [{ name: 'Access-Control-Allow-Origin', value: '*' }],
    agent: { http: http.Agent(), baseUrl: '' }
};

describe('useCollateralInfo tests', () => {

    const PROVIDER_URL = `http://localhost:${CONTAINER_PORT}`

    let mongoContainerInstance: UMASnapshotContainer
    let injectedProvider: ethers.providers.Provider
    let empAddress: EthereumAddress

    beforeAll(async () => {
        // mongoContainerInstance = new UMASnapshotContainer()
        // await mongoContainerInstance.init()
        // await mongoContainerInstance.start()
        // await delay(10000)

        injectedProvider = new Web3HttpProvider(PROVIDER_URL, options);
        const ethersJSProvider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
        const signer = ethersJSProvider.getSigner()

        // create sample EMP
        empAddress = await deploySampleEMP(signer)
    })

    const render = () => {
        const wrapper = ({ children }: any) => <ReactWeb3Provider injectedProvider={injectedProvider}>{children}</ReactWeb3Provider>
        const result = renderHook(() => useCollateralInfo(empAddress), { wrapper })
        return result
    }

    test('values are defined', async () => {
        const { result, waitForNextUpdate } = render()

        console.log("Result", result.current.symbol)

        await waitForNextUpdate()

        expect(result.current.symbol).toBeDefined()

        console.log("Result", result.current)
    })

    // afterAll(async () => {
    //     await mongoContainerInstance.stop()
    // })
})