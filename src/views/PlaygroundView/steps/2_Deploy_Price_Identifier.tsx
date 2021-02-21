import React, { useState } from "react"
import { ethers, utils } from "ethers"
import { Formik, FormikErrors, Form as FormikForm } from "formik"
import { Form, Button as BootstrapButton, Row, Col } from "react-bootstrap"
import { useHistory } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"

import IdentifierWhitelistArtifact from "@uma/core/build/contracts/IdentifierWhitelist.json"

import { useRemix, useUMARegistry } from "../../../hooks"
import { debug, defaultTransactionValues } from "../../../utils"
import { useGlobalState, useStep } from "../hooks"
import { FormItem } from "../components"
import { SuccessMessage, ErrorMessage } from "../components"
import { Button, StyledButton } from "../../../components"
import { DELAY_AFTER_FORM_CREATION } from "../../../constants"

interface FormProps {
  priceIdentifier: string
}

const initialValues: FormProps = {
  priceIdentifier: "",
}

enum MODE {
  SelectPriceIdentifier = "SelectPriceIdentifier",
  DeployPriceIdentifier = "DeployPriceIdentifier",
}

export const DeployPriceIdentifier: React.FC = () => {
  const { priceIdentifiers, setSelectedPriceIdentifier, selectedPriceIdentifier } = useGlobalState()
  const [mode, setMode] = useState(MODE.SelectPriceIdentifier)
  const { getNextStep, goNextStep, getStepBefore, goStepBefore } = useStep()
  const history = useHistory()

  const handleOnDeployClick = () => {
    setMode(MODE.DeployPriceIdentifier)
  }

  const handleOnCancelClick = () => {
    setMode(MODE.SelectPriceIdentifier)
  }

  const onSuccessCallback = () => {
    setMode(MODE.SelectPriceIdentifier)
  }

  const handleSelectChange = (e: any) => {
    setSelectedPriceIdentifier(e.target.value)
  }

  const handleOnNextClick = () => {
    const nextStep = getNextStep()
    if (nextStep) {
      goNextStep()
      console.log("nextStep.route", nextStep.route)
      history.push(nextStep.route)
    }
  }

  const handleOnBackClick = () => {
    const stepBefore = getStepBefore()
    if (stepBefore) {
      goStepBefore()
      console.log("stepBefore.route", stepBefore.route)
      history.push(stepBefore.route)
    }
  }

  return (
    <React.Fragment>
      {mode === MODE.SelectPriceIdentifier && (
        <React.Fragment>
          <h4>Select price identifier</h4>
          <Form>
            <Row>
              <Col md={10}>
                <Form.Control
                  as="select"
                  value={selectedPriceIdentifier || "0"}
                  disabled={priceIdentifiers.length === 0}
                  onChange={handleSelectChange}
                >
                  {priceIdentifiers.length === 0 && <option value="0">No price identifiers</option>}
                  <option value="0">Select an option</option>
                  {priceIdentifiers.length > 0 &&
                    priceIdentifiers.map((item, index) => {
                      return (
                        <option key={index} value={item}>
                          {item}
                        </option>
                      )
                    })}
                </Form.Control>
              </Col>
              <BootstrapButton size="sm" variant="primary" onClick={handleOnDeployClick}>
                <FontAwesomeIcon icon={faPlus} />
              </BootstrapButton>{" "}
            </Row>

            <div style={{ marginTop: "1em" }}>
              <StyledButton disabled={selectedPriceIdentifier === ""} variant="success" onClick={handleOnNextClick}>
                Next
              </StyledButton>

              <StyledButton variant="link" onClick={handleOnBackClick}>
                Back
              </StyledButton>
            </div>
          </Form>
        </React.Fragment>
      )}

      {mode === MODE.DeployPriceIdentifier && (
        <DeployPriceIdentifierView onCancelCallback={handleOnCancelClick} onSuccessCallback={onSuccessCallback} />
      )}
    </React.Fragment>
  )
}

interface DeployPriceIdentifierViewProps {
  onCancelCallback: () => void
  onSuccessCallback: () => void
}

const DeployPriceIdentifierView: React.FC<DeployPriceIdentifierViewProps> = ({
  onCancelCallback,
  onSuccessCallback,
}) => {
  const { setSelectedPriceIdentifier } = useGlobalState()
  const { getContractAddress } = useUMARegistry()
  const { clientInstance } = useRemix()
  const [error, setError] = useState<string | undefined>(undefined)
  const [priceIdentifierHasBeenCreated, setPriceIdentifierHasBeenCreated] = useState(false)

  const handleSubmit = (values: FormProps, { setSubmitting, resetForm }) => {
    debug("Deploying price identifier", values)
    setError(undefined)

    const sendTx = async () => {
      const accounts = await clientInstance.udapp.getAccounts()
      debug("Accounts", accounts)

      const address = getContractAddress("IdentifierWhitelist")
      debug("address", address)

      const identifierBytes = utils.formatBytes32String(values.priceIdentifier)

      const identifierWhitelistInterface = new ethers.utils.Interface(IdentifierWhitelistArtifact.abi)
      const addSupportedIdentifierEncodedData = identifierWhitelistInterface.encodeFunctionData(
        "addSupportedIdentifier",
        [identifierBytes]
      )

      await clientInstance.udapp.sendTransaction({
        ...defaultTransactionValues,
        data: addSupportedIdentifierEncodedData,
        from: accounts[0],
        to: address,
      })

      debug("Added supported identifier", identifierBytes)

      setSelectedPriceIdentifier(values.priceIdentifier)
    }

    setTimeout(() => {
      sendTx()
        .then(() => {
          setSubmitting(false)
          setPriceIdentifierHasBeenCreated(true)
          resetForm({})
          setTimeout(() => {
            onSuccessCallback()
          }, DELAY_AFTER_FORM_CREATION)
        })
        .catch((e) => {
          debug(e)
          setSubmitting(false)
          setError(e.message.replace("VM Exception while processing transaction: revert", "").trim())
        })
    }, 2000)
  }

  return (
    <React.Fragment>
      <Formik
        initialValues={initialValues}
        validate={(values) => {
          const errors: FormikErrors<FormProps> = {}
          if (!values.priceIdentifier) {
            errors.priceIdentifier = "Required"
          }
          return errors
        }}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <FormikForm>
            <FormItem label="Price Identifier" field="priceIdentifier" placeHolder="ETH/USD" />

            {!priceIdentifierHasBeenCreated && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingRight: "2.5em",
                  marginTop: "0em",
                  marginBottom: "2em",
                }}
              >
                <Button
                  variant="primary"
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  isloading={isSubmitting}
                  loadingText="Deploying..."
                  text="Deploy"
                />

                <Button
                  variant="danger"
                  size="sm"
                  isloading={false}
                  loadingText=""
                  text="Cancel"
                  onClick={onCancelCallback}
                />
              </div>
            )}

            <SuccessMessage show={priceIdentifierHasBeenCreated}>
              You have successfully deployed the price identifier.
            </SuccessMessage>
            <ErrorMessage show={error !== undefined}>{error}</ErrorMessage>
          </FormikForm>
        )}
      </Formik>
    </React.Fragment>
  )
}
