import React, { useEffect, useState } from "react"
import { Button, Col, Container, Row } from "react-bootstrap"
import { useMediaQuery, InputBase, MenuItem, ListItemText, Select, Dialog } from "@material-ui/core"
import { withStyles, useTheme } from "@material-ui/core/styles"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import IconButton from "@material-ui/core/IconButton"
import CloseIcon from "@material-ui/icons/Close"
import { makeStyles } from "@material-ui/core/styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import ExpiringMultiPartyArtifact from "@uma/core/build/contracts/ExpiringMultiParty.json"
import ExpandedIERC20Artifact from "@uma/core/build/contracts/ExpandedERC20.json"

import { TITLE } from "../../text"

import { StepProvider, useGlobalState } from "./hooks"
import { Stepmanager } from "./steps"
import { NavMenu, RightPanel } from "./sections"
import { ethers } from "ethers"
import { ReactWeb3Provider, useRemix } from "../../hooks"
import { EMPBody } from "./EMPBody"

const BootstrapInput = withStyles((theme) => ({
  root: {
    backgroundColor: theme.selectBackgroundColor,
    width: `100%`,
  },
  input: {
    display: "flex",
    paddingLeft: "16px",
    alignItems: "center",
  },
}))(InputBase)

const BLUE_COLOR = "#222336"

export interface Emp {
  name: string
  symbol: string
  address: string
}

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "relative",
    backgroundColor: `${BLUE_COLOR}`,
    color: "white",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}))

export const PlaygroundView: React.FC = () => {
  const theme = useTheme()
  const { signer, web3Provider } = useRemix()
  const { resetModalData, empAddresses, setSelectedEMPAddress, selectedEMPAddress } = useGlobalState()
  const [isLoading, setIsLoading] = useState(false)

  const [emps, setEmps] = useState<Emp[]>([])

  useEffect(() => {
    console.log("getAllEmpData playground running")
    const getAllEmpData = async () => {
      setIsLoading(true)
      const empMapped = empAddresses.map(async (expiringMultiPartyAddress) => {
        const empContract = new ethers.Contract(expiringMultiPartyAddress, ExpiringMultiPartyArtifact.abi, signer)
        const syntheticTokenAddress = await empContract.tokenCurrency()
        const syntheticContract = new ethers.Contract(syntheticTokenAddress, ExpandedIERC20Artifact.abi, signer)

        // synthetic token
        const syntheticToken = {
          address: syntheticTokenAddress,
          name: await syntheticContract.name(),
          symbol: await syntheticContract.symbol()
        }

        return {
          name: syntheticToken.name,
          symbol: syntheticToken.symbol,
          address: expiringMultiPartyAddress,
        }
      })
      const result = Promise.all(empMapped)
      return result
    }

    getAllEmpData()
      .then((result) => {
        setEmps(result)
        setIsLoading(false)
      })
      .catch((error) => console.log("Error"))
  }, [empAddresses])

  useEffect(() => {
    setIsLoading(true)
    setSelectedEMPAddress("0")
  }, [])

  const largeScreen = useMediaQuery(theme.breakpoints.up("sm"))
  const [open, setOpen] = React.useState(false)

  const handleClose = () => {
    setOpen(false)
    resetModalData()
  }
  const handleShow = () => setOpen(true)

  const handleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value
    setSelectedEMPAddress(value === 0 ? "0" : (value as string))
  }

  const noEmpsOrLoading = emps.length === 0 || isLoading

  const prettyAddress = (x: string) => {
    return x.substr(0, 6) + "..." + x.substr(x.length - 6, x.length)
  }

  return (
    <React.Fragment>
      <h2>{TITLE}</h2>
      <Container fluid={true} style={{ padding: "2em 0" }}>
        {/* EMP Selector */}
        <div style={{ display: "flex", justifyContent: "left" }}>
          <Col sm={8} md={9} lg={8} className="align-items-left">
            <Select
              value={isLoading || selectedEMPAddress === "0" ? 0 : selectedEMPAddress}
              onChange={handleChange}
              input={<BootstrapInput />}
              disabled={noEmpsOrLoading}
            >
              <MenuItem value={0}>
                <ListItemText
                  primary={
                    isLoading
                      ? "Please wait. Loading list of EMPs..."
                      : emps.length === 0
                        ? "There are not existing EMPs"
                        : "Select an EMP"
                  }
                />
              </MenuItem>

              {emps.map((emp) => {
                return (
                  <MenuItem value={emp.address} key={emp.address}>
                    <ListItemText
                      primary={largeScreen ? emp.name : emp.symbol}
                      secondary={largeScreen ? emp.address : prettyAddress(emp.address)}
                    />
                  </MenuItem>
                )
              })}
            </Select>
          </Col>
          <Col sm={4} md={3}>
            <Button variant="primary" onClick={handleShow} style={{ padding: "0.7em 1em" }}>
              <FontAwesomeIcon icon={faPlus} />
              {"  "}
              Create EMP
            </Button>{" "}
          </Col>
        </div>

        {/* EMP Body */}
        {emps && emps.length > 0 && selectedEMPAddress !== "0" &&
          <ReactWeb3Provider injectedProvider={web3Provider}>
            <EMPBody empAdress={selectedEMPAddress} />
          </ReactWeb3Provider>
        }

        {/* EMP Dialog */}
        <Dialog maxWidth="lg" fullWidth={true} open={open} onClose={handleClose}>
          {open && (
            <React.Fragment>
              <DialogHeader onCloseClick={handleClose} />
              <StepProvider>
                <Container
                  fluid={true}
                  style={{ padding: "2em", height: "900px", overflow: "scroll", backgroundColor: `${BLUE_COLOR}` }}
                >
                  <Row>
                    <Col md={3} style={{ paddingLeft: "0", paddingRight: "0" }}>
                      <NavMenu />
                    </Col>
                    <Col md={5} style={{ padding: "0", display: "flex", flexDirection: "column" }}>
                      <Stepmanager closeModalTrigger={handleClose} />
                    </Col>
                    <Col md={3} style={{ paddingLeft: "0", paddingRight: "0" }}>
                      <RightPanel />
                    </Col>
                  </Row>
                </Container>
              </StepProvider>
            </React.Fragment>
          )}
        </Dialog>
      </Container>
    </React.Fragment>
  )
}

interface DialogHeaderProps {
  onCloseClick: () => void
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ onCloseClick }) => {
  const classes = useStyles()
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
