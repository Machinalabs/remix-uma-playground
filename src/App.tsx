import React from "react"

import { Routes } from "./routes"
import { RemixProvider, UMARegistryProvider } from "./hooks"

import "./App.css"

const App = () => {
  return (
    <RemixProvider>
      <UMARegistryProvider>
        <Routes />
      </UMARegistryProvider>
    </RemixProvider>
  )
}

export default App
