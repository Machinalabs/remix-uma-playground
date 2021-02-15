import React, { PropsWithChildren, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { EthereumAddress } from "../types";

type Web3Provider = ethers.providers.Web3Provider;
type Signer = ethers.Signer;
type Block = ethers.providers.Block;

interface IWeb3Provider {
    signer: Signer | undefined
    provider: Web3Provider | undefined
    block$: Observable<Block> | undefined
    address: EthereumAddress
    setAddress: (newAddress: EthereumAddress) => void
}

const Web3Context = React.createContext<IWeb3Provider>({
    provider: undefined,
    signer: undefined,
    block$: undefined,
    address: "",
    setAddress: (newAddress: EthereumAddress) => { throw new Error("Not implemented") }
})

interface ReactWeb3ProviderProps {
    injectedProvider: any // TODO
}

export const ReactWeb3Provider: React.FC<PropsWithChildren<ReactWeb3ProviderProps>> = ({ children, injectedProvider }) => {
    const [provider, setWeb3Provider] = useState<Web3Provider | undefined>(undefined)
    const [signer, setSigner] = useState<Signer | undefined>(undefined)
    const [block$, setBlock$] = useState<Observable<Block> | undefined>(undefined);
    const [address, setAddress] = useState("")

    useEffect(() => {
        if (injectedProvider) {
            // web3 provider
            const ethersJSProvider = injectedProvider
            setWeb3Provider(ethersJSProvider)

            // signer
            const signer = ethersJSProvider.getSigner()
            setSigner(signer)

            // block
            const observable = new Observable<Block>((subscriber) => {
                ethersJSProvider.on("block", (blockNumber: number) => {
                    ethersJSProvider
                        .getBlock(blockNumber)
                        .then((block) => subscriber.next(block));
                });
            });
            // debounce to prevent subscribers making unnecessary calls
            const block$ = observable.pipe(debounceTime(1000));
            setBlock$(block$);
        }
    }, [injectedProvider])

    return (
        <Web3Context.Provider
            value={{
                provider,
                signer,
                block$,
                address,
                setAddress
            }}>
            {children}
        </Web3Context.Provider>
    )
}

export const useWeb3Provider = (): IWeb3Provider => {
    const context = useContext(Web3Context)

    if (context === null) {
        throw new Error("useWeb3Provider() can only be used inside of <ReactWeb3Provider />, please declare it at a higher level")
    }
    return context
}
