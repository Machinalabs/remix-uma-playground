import { act, renderHook } from '@testing-library/react-hooks'
import { ethers } from 'ethers'
import React from 'react'
import { EthereumAddress } from '../types'

import { UMASnapshotContainer, PROVIDER_URL, getInjectedProvider, startUMASnapshotContainerOrSkip, stopUMASnapshotContainerOrSkip } from '../utils'

import { ReactWeb3Provider } from './useWeb3Provider'
import { useCollateralInfo } from './useCollateralInfo'
import { deploySampleEMP } from './utils'

describe('useCollateralInfo tests', () => {
    let umaSnapshotContainer: UMASnapshotContainer | undefined
    let injectedProvider: ethers.providers.Web3Provider
    let empAddress: EthereumAddress

    beforeAll(async () => {
        umaSnapshotContainer = await startUMASnapshotContainerOrSkip()
        injectedProvider = new ethers.providers.Web3Provider(getInjectedProvider(PROVIDER_URL));
        const signer = injectedProvider.getSigner()

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

    afterAll(async () => {
        await stopUMASnapshotContainerOrSkip(umaSnapshotContainer)
    })
})