import React, { useState } from 'react'
import styled from "styled-components";
import {
    InputBase,
    MenuItem,
    ListItemText,
    Select,
    withStyles,
    Box,
    FormControl
} from "@material-ui/core";

import { useEMPData } from '../../../../hooks';
import { EthereumAddress } from '../../../../types';
import { Create, Deposit, Withdraw, Redeem, SettleExpired } from '../ManagePosition';

export type Method = "create" | "deposit" | "withdraw" | "redeem" | "settle";

const DEFAULT_METHOD = "create";

interface ActionSectionProps {
    empAddress: EthereumAddress
}

export const ActionsSection: React.FC<ActionSectionProps> = ({ empAddress }) => {
    const { state: empState } = useEMPData(empAddress)

    const [method, setMethod] = useState<Method>(DEFAULT_METHOD);

    const handleChange = (e: React.ChangeEvent<{ value: unknown }>) => setMethod(e.target.value as Method);

    return (
        <React.Fragment>
            <MethodSelector isExpired={empState.isExpired} handleChange={handleChange} method={method} />

            {method === "create" && <Create />}
            {method === "deposit" && <Deposit />}
            {method === "withdraw" && <Withdraw />}
            {method === "redeem" && <Redeem />}
            {method === "settle" && <SettleExpired />}
        </React.Fragment>)
}

interface MethodSelectorProps {
    method: any
    handleChange: any
    isExpired?: boolean
}

const BootstrapInput = withStyles((theme) => ({
    root: {
        backgroundColor: theme.selectBackgroundColor,
        width: `100%`
    },
    input: {
        display: "flex",
        paddingLeft: "16px",
        alignItems: "center",
    },
}))(InputBase);


const FormWrapper = styled(FormControl)`
  width: 100%;
`;

export const MethodSelector: React.FC<MethodSelectorProps> = ({ method, handleChange, isExpired }) => {
    return (
        <Box py={2}>
            <FormWrapper>
                <p style={{ color: 'white' }}>Actions</p>
                <Select
                    labelId="demo-simple-select-label"
                    value={method}
                    onChange={handleChange}
                    input={<BootstrapInput />}>

                    {isExpired ? [
                        <MenuItem key={"settle"} value={"settle"}>
                            <ListItemText
                                primary="Settle"
                                secondary="Settle expired tokens at settlement price."
                            />
                        </MenuItem>,
                        <MenuItem key={"withdraw"} value={"withdraw"}>
                            <ListItemText
                                primary="Withdraw"
                                secondary="Cancel pending withdrawal requests"
                            />
                        </MenuItem>,
                        <MenuItem key={"redeem"} value={"redeem"}>
                            <ListItemText
                                primary="Redeem"
                                secondary="Redeem synthetic tokens for locked collateral."
                            />
                        </MenuItem>,
                    ] : [
                            <MenuItem key={"create"} value={"create"}>
                                <ListItemText
                                    primary="Create"
                                    secondary="Mint new synthetic tokens."
                                />
                            </MenuItem>,
                            <MenuItem key={"deposit"} value={"deposit"}>
                                <ListItemText
                                    primary="Deposit"
                                    secondary="Add to position collateral."
                                />
                            </MenuItem>,
                            <MenuItem key={"withdraw"} value={"withdraw"}>
                                <ListItemText
                                    primary="Withdraw"
                                    secondary="Remove position collateral"
                                />
                            </MenuItem>,
                            <MenuItem key={"redeem"} value={"redeem"}>
                                <ListItemText
                                    primary="Redeem"
                                    secondary="Redeem synthetics for collateral."
                                />
                            </MenuItem>
                        ]}
                </Select>
            </FormWrapper>
        </Box>
    )
}