import React from "react"
import { Card, Col, Container, Row } from "react-bootstrap"
import styled from "styled-components"
import { Loader } from "../../../components"
import { useGeneralInfo, useTotals } from "../../../hooks"
import { useDisputeParams } from "../../../hooks/useDisputeParams"
import { useGlobalState } from "../hooks"

const StyledCol = styled(Col)`
  padding: 0;
  padding-top: 1em;
`

export const GeneralInfoSection: React.FC = () => {
  const { selectedEMPAddress } = useGlobalState()
  const { gcr, totalCollateral, totalSyntheticTokens } = useTotals(selectedEMPAddress)
  const generalInfo = useGeneralInfo(selectedEMPAddress)
  const { liquidationLiveness, withdrawalLiveness } = useDisputeParams(selectedEMPAddress)
  console.log("selectedEMPAddress", selectedEMPAddress)

  if (!generalInfo) {
    return <Loader />
  }
  const { expireDate, isExpired, priceIdentifier, minimunSponsorTokens } = generalInfo

  return (
    <Container fluid={true}>
      <Row>
        <StyledCol style={{ paddingRight: "1em" }}>
          <Card>
            <Card.Body>
              <Card.Title>{totalCollateral}</Card.Title>
              <Card.Text className="mb-2 text-muted">of collateral supplied</Card.Text>
            </Card.Body>
          </Card>
        </StyledCol>
        <StyledCol style={{ paddingLeft: "1em" }}>
          <Card>
            <Card.Body>
              <Card.Title>{totalSyntheticTokens}</Card.Title>
              <Card.Text className="mb-2 text-muted">of synthetic tokens outstanding</Card.Text>
            </Card.Body>
          </Card>
        </StyledCol>
      </Row>
      <Row>
        <StyledCol style={{ paddingRight: "1em" }}>
          <h5>General Info</h5>
          <p>
            Expire date: <span>{expireDate}</span>
          </p>
          <p>
            Is expired: <span>{isExpired}</span>
          </p>
          <p>
            Price identifier: <span>{priceIdentifier}</span>
          </p>
          <p>
            Global collateral ratio: <span>{gcr}</span>
          </p>
          <p>
            Minimum sponsor tokens: <span>{minimunSponsorTokens}</span>
          </p>
        </StyledCol>
        <StyledCol style={{ paddingLeft: "1em" }}>
          <h5>Dispute Params</h5>
          <p>
            Withdrawal liveness in min: <span>{withdrawalLiveness}</span>
          </p>
          <p>
            Liquidation liveness in min: <span>{liquidationLiveness}</span>
          </p>
        </StyledCol>
      </Row>
    </Container>
  )
}
