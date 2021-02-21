import { Box } from "@material-ui/core"
import React, { useState } from "react"
import { Container, Col, Tabs, Tab, Spinner } from "react-bootstrap"
import { useEMPAt, EMPProvider } from "../../hooks"

import { EthereumAddress } from "../../types"

import { GeneralInfoSection, ManagePositionSection } from "./sections"

const GENERAL_INFO_KEY = "general_info"

const MANAGE_POSITION_KEY = "manage_position"

interface Props {
  empAdress: EthereumAddress
}

export const EMPBody: React.FC<Props> = ({ empAdress }) => {
  const [key, setKey] = useState<string>(GENERAL_INFO_KEY)
  const { instance } = useEMPAt(empAdress)

  return (
    <Container fluid={true} style={{ padding: "2em 0" }}>
      <div style={{ display: "flex", justifyContent: "left" }}>
        <Col md={10} lg={8} className="align-items-left">
          {instance ?
            <EMPProvider empInstance={instance}>
              <Tabs id="controlled-tab" activeKey={key} onSelect={(k: any) => setKey(k)}>
                <Tab eventKey={GENERAL_INFO_KEY} title="General Info">
                  <GeneralInfoSection />
                </Tab>
                <Tab eventKey={MANAGE_POSITION_KEY} title="Manage Position">
                  <ManagePositionSection />
                </Tab>
              </Tabs>
            </EMPProvider>
            : <Box pt={2} textAlign="center">
              <Spinner animation="border" role="status">
                <span className="sr-only">Loading...</span>
              </Spinner>
            </Box>}
        </Col>
      </div>
    </Container>
  )
}
