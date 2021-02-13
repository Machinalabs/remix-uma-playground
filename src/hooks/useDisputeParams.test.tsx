import { act, renderHook } from '@testing-library/react-hooks'
import { ethers } from 'ethers'
import React from 'react'
import { EthereumAddress } from '../types'

import { UMASnapshotContainer, delay, CONTAINER_PORT } from '../utils'

import { getUMAAddresses, getUMAInterfaces } from './useUMARegistry'
import { ReactWeb3Provider } from './useWeb3Provider'
import { buildFakeEMP } from './faker'
import { useDisputeParams } from './useDisputeParams'

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

describe('useGeneralInfo tests', () => {

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

        const allUMAInterfaces = getUMAInterfaces()
        const ethersJSProvider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
        const signer = ethersJSProvider.getSigner()

        // create sample EMP
        const fakeEMP = buildFakeEMP()

        const expiringMultiPartyCreatorAddress = getUMAAddresses().get('ExpiringMultiPartyCreator') as string

        const expiringMultipartyCreatorInterface = allUMAInterfaces.get('ExpiringMultiPartyCreator') as ethers.utils.Interface

        const expiringMultipartyCreator = new ethers.Contract(
            expiringMultiPartyCreatorAddress,
            expiringMultipartyCreatorInterface,
            signer
        )
        const expiringMultiPartyAddress = await expiringMultipartyCreator.callStatic.createExpiringMultiParty(fakeEMP)
        console.log("ExpiringMultiPartyAddress", expiringMultiPartyAddress)
        const txn = await expiringMultipartyCreator.createExpiringMultiParty(fakeEMP)
        // console.log("transaction", txn)

        const receipt = await txn.wait()
        // console.log("Receipt", receipt)
        empAddress = expiringMultiPartyAddress
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