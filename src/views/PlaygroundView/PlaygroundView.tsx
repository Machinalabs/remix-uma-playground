import React, { useState } from "react"
import { Button, Col, Container, Row, Form, Modal } from "react-bootstrap"

import { TITLE, MODAL_TITLE } from "../../text"

import { StepProvider } from "./hooks"
import { Stepmanager } from "./steps"
import { NavMenu, RightPanel } from "./sections"
import {
  Box,
  useMediaQuery,
  InputBase,
  MenuItem,
  FormControl,
  ListItemText,
  Select,
  Dialog
} from "@material-ui/core";
import { withStyles, useTheme } from "@material-ui/core/styles";
// import Slide from '@material-ui/core/Slide';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';

// import Slide from '@material-ui/core/Slide'
// Creo 2 bootstrap input, uno para dark y uno para light
// a este solo le falta cambiar el color del svg
const BootstrapInput = withStyles((theme) => ({
  root: {
    position: "relative",
    transition: "background-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
    backgroundColor: "rgba(255, 255, 255, 0.09)", // color background del input
    width: `100%`,
  },
  input: {
    color: "white",
    display: "flex",
    paddingLeft: "16px",
    alignItems: "center",
  },
}))(InputBase);

const BLUE_COLOR = '#222336';

export interface Emp {
  name: string;
  symbol: string;
  address: string;
}

enum MODE {
  CREATE_EMP = "Create_EMP",
  INTERACT_EMP = "Interact_EMP"
}

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
    backgroundColor: `${BLUE_COLOR}`,
    color: 'white'
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}))

export const PlaygroundView: React.FC = () => {
  const theme = useTheme();
  const classes = useStyles();
  const [empAddress, setEmpAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false)
  const [emps, setEmps] = useState<Emp[]>([]);
  const largeScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const [mode, setMode] = useState(MODE.INTERACT_EMP)
  const [open, setOpen] = React.useState(false);

  const handleClose = () => setOpen(false);
  const handleShow = () => setOpen(true);

  const handleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value;
    setEmpAddress(value === 0 ? null : (value as string));
  };

  const noEmpsOrLoading = emps.length === 0 || isLoading;

  const prettyAddress = (x: string) => {
    return x.substr(0, 6) + "..." + x.substr(x.length - 6, x.length);
  };

  return (
    <React.Fragment>
      <h2>{TITLE}</h2>
      <Container fluid={true} style={{ padding: "2em 0" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Col md={10} className="align-items-center">
            <Select
              value={isLoading || empAddress === null ? 0 : empAddress}
              onChange={handleChange}
              input={<BootstrapInput />}
              disabled={noEmpsOrLoading}>

              <MenuItem value={0}>
                <ListItemText
                  primary={isLoading ? "Please wait. Loading list of EMPs..." : "Select an EMP"}
                />
              </MenuItem>

              {emps.map((emp) => {
                return (
                  <MenuItem value={emp.address} key={emp.address}>
                    <ListItemText
                      primary={largeScreen ? emp.name : emp.symbol}
                      secondary={
                        largeScreen ? emp.address : prettyAddress(emp.address)
                      }
                    />
                  </MenuItem>
                );
              })}
            </Select>
          </Col>
          <Col md="auto">
            <Button variant="primary" onClick={handleShow}>+ Create EMP</Button>{' '}
          </Col>

        </div>

        <Dialog maxWidth="xl" fullWidth={true} open={open} onClose={handleClose}>
          <AppBar className={classes.appBar}>
            <Toolbar>
              <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

          {/* TODO: Review height in different screen sizes */}
          <StepProvider>
            <Container fluid={true} style={{ padding: "2em", height: "900px", backgroundColor: `${BLUE_COLOR}` }}>
              <Row>
                <Col md="auto" style={{ paddingLeft: "0", paddingRight: "0" }}>
                  <NavMenu />
                </Col>
                <Col xs={6} lg={4} style={{ display: "flex", flexDirection: "column" }}>
                  <Stepmanager />
                </Col>
                <Col xs={3} md={3} lg={3} style={{ paddingLeft: "0", paddingRight: "0" }}>
                  <RightPanel />
                </Col>
              </Row>
            </Container>
          </StepProvider>
        </Dialog>
      </Container>
    </React.Fragment>
  )
}