import React from "react"
import { BrowserRouter as Router, Switch, Route, RouteProps } from "react-router-dom"

import { ErrorView, HomeView, PlaygroundView } from "./views"
import { DefaultLayout } from "./layouts"
import { PLAYGROUND_ROUTE } from "./constants"

interface Props extends RouteProps {
  component: any // TODO: new (props: any) => React.Component
  from: string
}

const RouteWithDefaultLayout = ({ component: Component, ...rest }: Props) => {
  return (
    <Route
      {...rest}
      render={(matchProps) => (
        <DefaultLayout {...rest}>
          <Component {...matchProps} />
        </DefaultLayout>
      )}
    />
  )
}

export const Routes = () => (
  <Router>
    <Switch>
      <RouteWithDefaultLayout exact={true} path="/" component={HomeView} from="/" />
      <RouteWithDefaultLayout path={PLAYGROUND_ROUTE} component={PlaygroundView} from="/tutorial" />
      <Route exact={true} path="/error">
        <ErrorView />
      </Route>
    </Switch>
  </Router>
)
