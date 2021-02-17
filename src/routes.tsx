import React from "react"
import { BrowserRouter as Router, Switch, Route, RouteProps } from "react-router-dom"

import { ErrorView, HomeView, PlaygroundView } from "./views"
import { DefaultLayout } from "./layouts"
import { PLAYGROUND_ROUTE } from "./constants"
import { useRemix } from "./hooks"
import { ThemeProvider } from "styled-components"
import { ThemeProvider as MaterialUIProvider, createMuiTheme } from "@material-ui/core/styles"
import { ContractProvider } from "./views/PlaygroundView/hooks"

import { getTheme } from "./theme"

interface Props extends RouteProps {
  component: any // TODO: new (props: any) => React.Component
  from: string
}

const RouteWithDefaultLayout = ({ component: Component, ...rest }: Props) => {
  const { themeType } = useRemix()

  const materialUITheme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: themeType,
        },
        selectBackgroundColor: themeType === "dark" ? "rgba(255, 255, 255, 0.09)" : "rgb(0 0 0 / 9%)",
      }),
    [themeType]
  )

  return (
    <Route
      {...rest}
      render={(matchProps) => (
        <ThemeProvider theme={getTheme(themeType)}>
          <MaterialUIProvider theme={materialUITheme}>
            <DefaultLayout {...rest}>
              <Component {...matchProps} />
            </DefaultLayout>
          </MaterialUIProvider>
        </ThemeProvider>
      )}
    />
  )
}

const PlaygroundRoute = () => {
  return (
    <ContractProvider>
      <PlaygroundView />
    </ContractProvider>
  )
}

export const Routes = () => (
  <Router>
    <Switch>
      <RouteWithDefaultLayout exact={true} path="/" component={HomeView} from="/" />
      <RouteWithDefaultLayout path={PLAYGROUND_ROUTE} component={PlaygroundRoute} from="/tutorial" />
      <Route exact={true} path="/error">
        <ErrorView />
      </Route>
    </Switch>
  </Router>
)
