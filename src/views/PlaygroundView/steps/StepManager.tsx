import React, { useEffect } from "react"
import { Route, Switch, useHistory, useRouteMatch } from "react-router-dom"

// steps
import { DeployCollateralToken } from "./1_Deploy_Collateral_Token"
import { DeployPriceIdentifier } from "./2_Deploy_Price_Identifier"
import { CreateExpiringMultiParty } from "./3_CreateExpiringMultiParty";

export const Stepmanager: React.FC = () => {
  const match = useRouteMatch()
  const history = useHistory()

  useEffect(() => {
    history.push(`${match.path}/deploy_collateral_token`)
  }, [])

  return (
    <React.Fragment>
      <Switch>
        <Route path={`${match.path}/deploy_collateral_token`}>
          <DeployCollateralToken />
        </Route>
        <Route path={`${match.path}/deploy_price_identifier`}>
          <DeployPriceIdentifier />
        </Route>
        <Route path={`${match.path}/create_expiring_multiparty`}>
          <CreateExpiringMultiParty />
        </Route>
      </Switch>
    </React.Fragment>
  )
}
