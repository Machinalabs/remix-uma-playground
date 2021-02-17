import React from "react"

import { Routes } from "./routes"
import { RemixProvider, UMARegistryProvider } from "./hooks"
import { ErrorBoundary } from "./ErrorBoundary"

import "./App.css"

// window.addEventListener("unhandledrejection", function (e) {
//   console.log(e);
//   alert(`unhandledrejection: ${e.reason}`);
// });

const App = () => {
  return (
    <ErrorBoundary>
      <RemixProvider>
        <UMARegistryProvider>
          <Routes />
        </UMARegistryProvider>
      </RemixProvider>
    </ErrorBoundary>
  )
}

export default App
