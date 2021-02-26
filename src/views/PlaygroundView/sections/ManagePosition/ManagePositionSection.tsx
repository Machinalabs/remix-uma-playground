import React, { useEffect, useState } from "react"
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
import { fromWei, toWeiSafe } from "../../../../utils"
import { PositionData } from "../../../../types"
import { WETH } from "../../../../constants"

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
    const { balance: syntheticBalance, symbol: syntheticSymbol } = syntheticState
    const { balance: collateralBalance, symbol: collateralSymbol } = collateralState

    const { syntheticTokens, collateral, backingCollateral } = positionData as PositionData

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
                <Card.Text as="div">
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
                <Card.Text as="div">
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
    return <Loader />
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
  const { empState, collateralState, instance: empInstance } = useEMPProvider()
  const { getContractInterface } = useUMARegistry()
  const { signer, address, provider, block$ } = useWeb3Provider()
  const [successful, setIsSuccessful] = useState(false)

  const [etherBalance, setEtherBalance] = useState<string | undefined>(undefined)

  const getEtherBalance = async () => {
    const balance = await provider?.getBalance(address)
    if (balance) {
      setEtherBalance(fromWei(balance))
    }
  }

  useEffect(() => {
    getEtherBalance()
  }, []) // eslint-disable-line

  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(async () => {
        getEtherBalance()
      })
      return () => sub.unsubscribe()
    }
  }, [block$]) // eslint-disable-line

  if (collateralState) {
    const { decimals: collateralDecimals, setMaxAllowance, symbol: collateralSymbol } = collateralState

    const handleSubmit = (values: FormProps, { setSubmitting }) => {
      setIsSuccessful(false)
      setError(undefined)

      const mint = () => {
        return new Promise(async (resolve) => {
          if (collateralSymbol === WETH) {
            const instance = new ethers.Contract(
              empState!.collateralCurrency as string,
              getContractInterface(WETH) as ethers.utils.Interface,
              signer
            )

            const receipt = await instance.deposit({
              value: toWeiSafe(values.amount, collateralDecimals)
            })
            await receipt.wait()

            const txApprove = await instance.approve(empInstance.address, ethers.constants.MaxUint256)
            await txApprove.wait()

            setTimeout(() => {
              resolve(true)
            }, 2000)

          } else {
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
          }
        })
      }

      mint()
        .then(() => {
          setIsSuccessful(true)
          setSubmitting(false)
          setTimeout(() => {
            setIsSuccessful(false)
            onClose()
          }, 2000)
        })
        .catch((e) => {
          console.log("error", e)
          setSubmitting(false)
          setError(e.message.replace("VM Exception while processing transaction: revert", "").trim())
        })
    }

    return (
      <Dialog maxWidth="md" open={isMintModalOpen} onClose={onClose}>
        <DialogHeader onCloseClick={onClose} />
        <Container
          fluid={true}
          style={{ padding: "1em 2em", height: "400px", width: "400px", backgroundColor: `${BLUE_COLOR}` }}
        >
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
                {collateralSymbol === WETH && <p>ETH Balance: <span>{etherBalance}</span></p>}
                <FormItem
                  key="amount"
                  label="Number of tokens to mint"
                  field="amount"
                  labelWidth={6}
                  placeHolder="Amount of tokens"
                  size="sm"
                  type="number"
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
              </Form>
            )}
          </Formik>

          <div style={{ marginTop: "1em" }}>
            <SuccessMessage show={successful}>You have successfully minting tokens.</SuccessMessage>
            <ErrorMessage show={error !== undefined}>{error}</ErrorMessage>
          </div>
        </Container>
      </Dialog>
    )
  } else {
    return <Loader />
  }
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
