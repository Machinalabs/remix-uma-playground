import React from 'react'
import { Card, Col, Container, Row } from 'react-bootstrap'
import styled from 'styled-components'

const StyledCol = styled(Col)`
    padding: 0;
    padding-top: 1em;
`
export const ManagePositionSection: React.FC = () => {
    return (
        <Container fluid={true}>
            <Row>
                <StyledCol>
                    <Card>
                        <Card.Body>
                            <Card.Title>Your Wallet</Card.Title>
                            <Card.Text>
                                <span>Collateral Balance</span>
                                <br />
                                <span>Token Balance</span>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </StyledCol>
            </Row>
            <Row>
                <StyledCol>
                    <Card>
                        <Card.Body>
                            <Card.Text>
                                <div style={{ display: "flex" }}>
                                    <StyledCol style={{ paddingRight: "1em" }}>
                                        <h5>Your Position</h5>
                                    </StyledCol>
                                    <StyledCol style={{ paddingLeft: "1em" }}>
                                        <h5>Contract Info</h5>
                                    </StyledCol>
                                </div>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </StyledCol>

            </Row>
        </Container>
    )
}