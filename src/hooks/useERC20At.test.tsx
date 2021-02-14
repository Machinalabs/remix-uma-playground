import { act, renderHook } from '@testing-library/react-hooks'
import { ethers } from 'ethers'
import React from 'react'
import { EthereumAddress } from '../types'

import { UMASnapshotContainer, getInjectedProvider, PROVIDER_URL, stopUMASnapshotContainerOrSkip, startUMASnapshotContainerOrSkip } from '../utils'

import { ReactWeb3Provider } from './useWeb3Provider'
import { useERC20At } from './useERC20At'
import { deployERC20 } from './utils'

describe('useERC20At tests', () => {
    let tokenAddress: EthereumAddress
    let umaSnapshotContainer: UMASnapshotContainer | undefined
    let injectedProvider: ethers.providers.Provider

    beforeAll(async () => {
        umaSnapshotContainer = await startUMASnapshotContainerOrSkip()
        injectedProvider = getInjectedProvider(PROVIDER_URL)
        const ethersJSProvider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
        const signer = ethersJSProvider.getSigner()

        // deploy token
        tokenAddress = await deployERC20(signer)
    })

    const render = () => {
        const wrapper = ({ children }: any) => <ReactWeb3Provider injectedProvider={injectedProvider}>{children}</ReactWeb3Provider>
        const result = renderHook(() => useERC20At(tokenAddress), { wrapper })
        return result
    }

    test('properties are defined', async () => {
        const { result } = render()

        expect(result.current.instance).toBeDefined()
    })

    afterAll(async () => {
        await stopUMASnapshotContainerOrSkip(umaSnapshotContainer)
    })
})