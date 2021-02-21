import React, { useState } from "react"
import { ethers } from "ethers"
import { Card, Col, Container, Row, Button as BootstrapButton } from "react-bootstrap"
import styled from "styled-components"
import { Formik, Form, FormikErrors } from "formik"
import { AppBar, Dialog, IconButton, makeStyles, Toolbar } from "@material-ui/core"
import CloseIcon from "@material-ui/icons/Close"

import { useEMPProvider, usePosition, useTotals, useUMARegistry, useWeb3Provider } from "../../../../hooks"
import { useGlobalState } from "../../hooks"
import { ActionsSection } from "../ManagePosition"
import { ErrorMessage, FormItem, SuccessMessage } from "../../components"
import { Button, Loader } from "../../../../components"
import { toWeiSafe } from "../../../../utils"
import { PositionData } from "../../../../types"

const StyledCol = styled(Col)`
  padding: 0;
  padding-top: 1em;
`

export const ManagePositionSection: React.FC = () => {
  const { selectedEMPAddress } = useGlobalState()
  const { address } = useWeb3Provider()
  const { collateralState, syntheticState } = useEMPProvider()
  const positionData = usePosition(address)

  const useTotalsState = useTotals()

  const [isMintModalOpen, setIsMintModalOpen] = useState(false)

  if (collateralState && syntheticState && positionData && useTotalsState) {
    const { gcr } = useTotalsState
    const {
      balance: syntheticBalance,
      symbol: syntheticSymbol,
      decimals: syntheticDecimals,
    } = syntheticState
    const {
      balance: collateralBalance,
      symbol: collateralSymbol,
      decimals: collateralDecimals,
    } = collateralState

    const { syntheticTokens, collateral, backingCollateral, collateralRatio } = positionData as PositionData

    const openMintModal = () => {
      setIsMintModalOpen(true)
    }

    const handleMintModalClose = () => {
      setIsMintModalOpen(false)
    }

    return (
      <Container fluid={true}>
        <Row>
          <StyledCol>
            <Card>
              <Card.Body>
                <Card.Title>Your Wallet</Card.Title>
                <Card.Text>
                  <span>
                    Collateral Balance: {collateralBalance} {collateralSymbol}
                    <BootstrapButton onClick={openMintModal} variant="link">
                      Mint
                    </BootstrapButton>
                  </span>
                  <br />
                  <span>
                    Token Balance: {syntheticBalance} {syntheticSymbol}
                  </span>
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
                  <StyledCol style={{ paddingRight: "1em", display: "flex", flexDirection: "column" }}>
                    <h5>Your Position</h5>
                    <p>
                      Collateral supplied: <span>{`${collateral} ${collateralSymbol}`}</span>
                    </p>
                    <p>
                      Collateral backing debt: <span>{`${backingCollateral} ${collateralSymbol}`}</span>
                    </p>
                    <p>
                      Token debt: <span>{`${syntheticTokens} ${syntheticSymbol}`}</span>
                    </p>
                    <p>
                      Collateral ratio (CR): <span>{gcr}</span>
                    </p>
                  </StyledCol>
                </Card.Text>
              </Card.Body>
            </Card>
          </StyledCol>
        </Row>

        <MintDialog isMintModalOpen={isMintModalOpen} onClose={handleMintModalClose} />

        <ActionsSection empAddress={selectedEMPAddress} />
      </Container>
    )
  } else {
    return (<Loader />)
  }
}

interface MintDialogProps {
  isMintModalOpen: boolean
  onClose: () => void
}

interface FormProps {
  amount: string
}

const initialValues: FormProps = {
  amount: "",
}

const MintDialog: React.FC<MintDialogProps> = ({ isMintModalOpen, onClose }) => {
  const [error, setError] = useState<string | undefined>(undefined)
  const { selectedEMPAddress } = useGlobalState()
  const { empState, collateralState } = useEMPProvider()
  const { getContractInterface } = useUMARegistry()
  const { signer, address } = useWeb3Provider()

  if (!collateralState) {
    return <Loader />
  }

  const { decimals: collateralDecimals, setMaxAllowance } = collateralState
  const handleSubmit = (values: FormProps, { setSubmitting }) => {
    const mint = () => {
      return new Promise(async (resolve) => {
        const instance = new ethers.Contract(
          empState!.collateralCurrency as string,
          getContractInterface("TestnetERC20") as ethers.utils.Interface,
          signer
        )
        const receipt = await instance.allocateTo(address, toWeiSafe(values.amount, collateralDecimals))
        await receipt.wait()

        await setMaxAllowance()

        setTimeout(() => {
          resolve(true)
        }, 2000)
      })
    }

    mint()
      .then(() => {
        setSubmitting(false)
        onClose()
      })
      .catch((err) => console.log("Fallo", err))
  }

  return (
    <Dialog maxWidth="md" open={isMintModalOpen} onClose={onClose}>
      <DialogHeader onCloseClick={onClose} />
      <Container
        fluid={true}
        style={{ padding: "1em 2em", height: "400px", width: "400px", backgroundColor: `${BLUE_COLOR}` }}
      >
        {/* <Row> */}
        <Formik
          initialValues={initialValues}
          validate={(values) => {
            return new Promise((resolve, reject) => {
              const errors: FormikErrors<FormProps> = {}
              if (!values.amount) {
                errors.amount = "Required"
              } else if (parseInt(values.amount, 10) < 0) {
                errors.amount = "Value cannot be negative"
              }
              resolve(errors)
            })
          }}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <FormItem
                key="amount"
                label="Number of tokens to mint"
                field="amount"
                labelWidth={6}
                placeHolder="Amount of tokens"
                size="sm"
              />

              <Button
                variant="primary"
                type="submit"
                size="sm"
                disabled={isSubmitting}
                isloading={isSubmitting}
                loadingText="Minting tokens..."
                text="Mint tokens"
              />

              {/* TODO */}
              <SuccessMessage show={false}>You have successfully created a position.</SuccessMessage>
              <ErrorMessage show={error !== undefined}>{error}</ErrorMessage>
            </Form>
          )}
        </Formik>
        {/* </Row> */}
      </Container>
    </Dialog>
  )
}
const BLUE_COLOR = "#222336"

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
        Mint
      </Toolbar>
    </AppBar>
  )
}
