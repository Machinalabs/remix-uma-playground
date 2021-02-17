import React, { useState } from "react"
import { Container, Col, Tabs, Tab } from "react-bootstrap"

import { GeneralInfoSection, ManagePositionSection } from "./sections"

const GENERAL_INFO_KEY = "general_info"

const MANAGE_POSITION_KEY = "manage_position"

export const EMPBody: React.FC = () => {
  const [key, setKey] = useState<string>(GENERAL_INFO_KEY)

  return (
    <Container fluid={true} style={{ padding: "2em 0" }}>
      <div style={{ display: "flex", justifyContent: "left" }}>
        <Col md={10} lg={8} className="align-items-left">
          <Tabs id="controlled-tab" activeKey={key} onSelect={(k: any) => setKey(k)}>
            <Tab eventKey={GENERAL_INFO_KEY} title="General Info">
              <GeneralInfoSection />
            </Tab>
            <Tab eventKey={MANAGE_POSITION_KEY} title="Manage Position">
              <ManagePositionSection />
            </Tab>
          </Tabs>
        </Col>
      </div>
    </Container>
  )
}
