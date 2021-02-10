import React from "react"

import { Routes } from "./routes"
import { RemixProvider, UMAProvider } from "./hooks"

import "./App.css"

const App = () => {
  return (
    <RemixProvider>
      <UMAProvider>
        <Routes />
      </UMAProvider>
    </RemixProvider>
  )
}

export default App
