import React, { useState } from "react"
import { Button, Col, Container, Row } from "react-bootstrap"
import {
  useMediaQuery,
  InputBase,
  MenuItem,
  ListItemText,
  Select,
  Dialog
} from "@material-ui/core";
import { withStyles, useTheme } from "@material-ui/core/styles";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'


import { TITLE } from "../../text"

import { StepProvider } from "./hooks"
import { Stepmanager } from "./steps"
import { NavMenu, RightPanel } from "./sections"

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

const BLUE_COLOR = '#222336';

export interface Emp {
  name: string;
  symbol: string;
  address: string;
}

// enum MODE {
//   CREATE_EMP = "Create_EMP",
//   INTERACT_EMP = "Interact_EMP"
// }

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

  const [empAddress, setEmpAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false)

  const [emps, setEmps] = useState<Emp[]>([{
    name: "EMP1",
    symbol: "emp1",
    address: "0x000000000000000000000000123123123"
  }]);

  const largeScreen = useMediaQuery(theme.breakpoints.up("sm"));
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
            <Button variant="primary" onClick={handleShow} style={{ padding: "0.7em 1em" }}>
              {/* <AddIcon /> */}
              <FontAwesomeIcon icon={faPlus} />
              {'  '}
              Create EMP
              </Button>{' '}
          </Col>

        </div>

        <Dialog maxWidth="lg" fullWidth={true} open={open} onClose={handleClose}>
          <DialogHeader onCloseClick={handleClose} />

          {/* TODO: Review height in different screen sizes */}
          <StepProvider>
            <Container fluid={true} style={{ padding: "2em", height: "900px", backgroundColor: `${BLUE_COLOR}` }}>
              <Row>
                <Col md={3} style={{ paddingLeft: "0", paddingRight: "0" }}>
                  <NavMenu />
                </Col>
                <Col md={5} style={{ padding: "0", display: "flex", flexDirection: "column" }}>
                  <Stepmanager />
                </Col>
                <Col md="auto" style={{ paddingLeft: "0", paddingRight: "0" }}>
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

interface DialogHeaderProps {
  onCloseClick: () => void
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ onCloseClick }) => {
  const classes = useStyles();
  return (
    <AppBar className={classes.appBar}>
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={onCloseClick} aria-label="close">
          <CloseIcon />
        </IconButton>
        Create Expiring Multiparty Contract
      </Toolbar>
    </AppBar>
  )
}