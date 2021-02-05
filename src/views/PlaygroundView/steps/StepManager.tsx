import React, { useEffect } from "react"
import { Route, Switch, useHistory, useRouteMatch } from "react-router-dom"
import { CREATE_EXPIRING_MULTIPARTY, SELECT_COLLATERAL_TOKEN, SELECT_PRICE_IDENTIFIER_ROUTE } from "../../../constants";

// steps
import { DeployCollateralToken } from "./1_Deploy_Collateral_Token"
import { DeployPriceIdentifier } from "./2_Deploy_Price_Identifier"
import { CreateExpiringMultiParty } from "./3_CreateExpiringMultiParty";

export const Stepmanager: React.FC = () => {
  const match = useRouteMatch()
  const history = useHistory()

  useEffect(() => {
    history.push(`${match.path}/${SELECT_COLLATERAL_TOKEN}`)
  }, [])

  return (
    <React.Fragment>
      <Switch>
        <Route path={`${match.path}/${SELECT_COLLATERAL_TOKEN}`}>
          <DeployCollateralToken />
        </Route>
        <Route path={`${match.path}/${SELECT_PRICE_IDENTIFIER_ROUTE}`}>
          <DeployPriceIdentifier />
        </Route>
        <Route path={`${match.path}/${CREATE_EXPIRING_MULTIPARTY}`}>
          <CreateExpiringMultiParty />
        </Route>
      </Switch>
    </React.Fragment>
  )
}
