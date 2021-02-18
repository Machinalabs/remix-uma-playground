import React, { PropsWithChildren, useContext, useEffect, useState } from "react"

import { PluginClient } from "@remixproject/plugin"
import { IRemixApi } from "@remixproject/plugin-api"
import { Api, PluginApi } from "@remixproject/plugin-utils"
import { ethers } from "ethers"

import { ThemeType } from "../types"
import { getProvider, log } from "../utils"

import { RemixClient } from "./RemixClient"

export type RemixClientInstanceType = PluginApi<Readonly<IRemixApi>> & PluginClient<Api, Readonly<IRemixApi>>

type Web3Provider = ethers.providers.Web3Provider
type Signer = ethers.Signer

interface IRemixProvider {
  clientInstance: RemixClientInstanceType
  themeType: ThemeType
  web3Provider: Web3Provider
  signer: ethers.Signer
}

/* tslint:disable */
const RemixContext = React.createContext<IRemixProvider>({
  clientInstance: {} as RemixClientInstanceType,
  themeType: "dark" as ThemeType,
  web3Provider: {} as Web3Provider,
  signer: {} as ethers.Signer,
})
/* tslint:enable */

const PLUGIN_NAME = "Remix Gas Profiler"

export const RemixProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [clientInstance, setClientInstance] = useState(undefined as any)
  const [themeType, setThemeType] = useState<ThemeType>("dark")
  const [web3Provider, setWeb3Provider] = useState<Web3Provider>({} as Web3Provider)
  const [signer, setSigner] = useState<Signer>({} as Signer)

  useEffect(() => {
    log(`${PLUGIN_NAME} loading...`)
    const loadClient = async () => {
      const client = new RemixClient()
      console.log("Client", client)
      await client.onload()
      log(`${PLUGIN_NAME} Plugin has been loaded`)

      setClientInstance(client)

      // web3 provider
      const remixProvider = getProvider(client)
      const ethersJSProvider = new ethers.providers.Web3Provider(remixProvider)
      setWeb3Provider(ethersJSProvider)

      // signer
      const newSigner = ethersJSProvider.getSigner()
      setSigner(newSigner)

      const currentTheme = await client.call("theme", "currentTheme")
      log("Current theme", currentTheme)

      setThemeType(currentTheme.brightness || currentTheme.quality)

      client.on("theme", "themeChanged", (theme: any) => {
        log("themeChanged")
        setThemeType(theme.quality)
      })

      if (!newSigner) {
        throw new Error("Signer not set")
      }

      if (!ethersJSProvider) {
        throw new Error("Web3 provider not set")
      }
    }

    loadClient()
  }, [])

  return (
    <RemixContext.Provider
      value={{
        clientInstance,
        themeType,
        web3Provider,
        signer,
      }}
    >
      {children}
    </RemixContext.Provider>
  )
}

export const useRemix = () => {
  const context = useContext(RemixContext)

  if (context === null) {
    throw new Error("useRemix() can only be used inside of <RemixProvider />, please declare it at a higher level")
  }
  return context
}
