import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { ethers } from 'ethers'

import { UMASnapshotContainer, getInjectedProvider, PROVIDER_URL, startUMASnapshotContainerOrSkip, stopUMASnapshotContainerOrSkip } from '../utils'
import { EthereumAddress } from '../types'

import { UMARegistryProvider } from './useUMARegistry'
import { ReactWeb3Provider } from './useWeb3Provider'
import { useCollateralToken } from './useCollateralToken'
import { deploySampleEMP } from './utils'

describe('useCollateralToken tests', () => {
    let empAddress: EthereumAddress
    let umaSnapshotContainer: UMASnapshotContainer | undefined
    let injectedProvider: ethers.providers.Web3Provider

    beforeAll(async () => {
        umaSnapshotContainer = await startUMASnapshotContainerOrSkip()
        injectedProvider = new ethers.providers.Web3Provider(getInjectedProvider(PROVIDER_URL));
        const signer = injectedProvider.getSigner()

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

    afterAll(async () => {
        await stopUMASnapshotContainerOrSkip(umaSnapshotContainer)
    })
})