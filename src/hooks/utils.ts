import { ethers } from "ethers"
import { buildFakeEMP } from "./faker"
import { getUMAAddresses, getUMAInterfaces } from "./useUMARegistry"
import TestnetERC20Artifact from "@uma/core/build/contracts/TestnetERC20.json"

export const deploySampleEMP = async (signer) => {
    const fakeEMP = buildFakeEMP()
    const allUMAInterfaces = getUMAInterfaces()

    const expiringMultiPartyCreatorAddress = getUMAAddresses().get('ExpiringMultiPartyCreator') as string

    const expiringMultipartyCreatorInterface = allUMAInterfaces.get('ExpiringMultiPartyCreator') as ethers.utils.Interface

    const expiringMultipartyCreator = new ethers.Contract(
        expiringMultiPartyCreatorAddress,
        expiringMultipartyCreatorInterface,
        signer
    )
    const expiringMultiPartyAddress = await expiringMultipartyCreator.callStatic.createExpiringMultiParty(fakeEMP)
    const txn = await expiringMultipartyCreator.createExpiringMultiParty(fakeEMP)
    await txn.wait()

    return expiringMultiPartyAddress
}

export const deployERC20 = async (signer) => {
    const newToken = {
        name: "SampleERC20",
        symbol: "SERC20",
        decimals: 18,
        totalSupply: 10000,
    }

    const testnetERC20Factory = new ethers.ContractFactory(
        TestnetERC20Artifact.abi,
        TestnetERC20Artifact.bytecode,
        signer
    )
    const collateralTokenContract = await testnetERC20Factory.deploy(
        newToken.name,
        newToken.symbol,
        newToken.decimals
    )

    await collateralTokenContract.deployTransaction.wait()
    return collateralTokenContract.address
}