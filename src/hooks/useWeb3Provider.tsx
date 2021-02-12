import React, { PropsWithChildren, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";

type Web3Provider = ethers.providers.Web3Provider;
type Signer = ethers.Signer;
type Block = ethers.providers.Block;

interface IWeb3Provider {
    signer: Signer | null
    provider: ethers.providers.Web3Provider | null
    block$: Observable<Block> | null
}

const Web3Context = React.createContext<IWeb3Provider>({
    provider: null,
    signer: null,
    block$: null
})

interface ReactWeb3ProviderProps {
    injectedProvider: any // TODO
}

export const ReactWeb3Provider: React.FC<PropsWithChildren<ReactWeb3ProviderProps>> = ({ children, injectedProvider }) => {
    const [provider, setWeb3Provider] = useState<Web3Provider | null>(null)
    const [signer, setSigner] = useState<Signer | null>(null)
    const [block$, setBlock$] = useState<Observable<Block> | null>(null);

    useEffect(() => {
        if (injectedProvider) {
            // web3 provider
            const ethersJSProvider = new ethers.providers.Web3Provider(injectedProvider)
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
                block$
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
