import React, { useState } from 'react'
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab'
import { GeneralInfoSection, ManagePositionSection } from './sections';

const GENERAL_INFO_KEY = "general_info"

const MANAGE_POSITION_KEY = "manage_position"

export const EMPBody: React.FC = () => {
    const [key, setKey] = useState<string>(GENERAL_INFO_KEY);

    return (

        <Tabs id="controlled-tab" activeKey={key} onSelect={(k: any) => setKey(k)}>
            <Tab eventKey={GENERAL_INFO_KEY} title="General Info">
                <GeneralInfoSection />
            </Tab>
            <Tab eventKey={MANAGE_POSITION_KEY} title="Manage Position">
                <ManagePositionSection />
            </Tab>
        </Tabs>
    )
}

