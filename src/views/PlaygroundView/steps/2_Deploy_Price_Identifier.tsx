import React, { useState } from "react"
import { Formik, FormikErrors, Form as FormikForm } from "formik"
import { Form, Button as BootstrapButton, Row, Col } from "react-bootstrap"
import IdentifierWhitelistArtifact from "@uma/core/build/contracts/IdentifierWhitelist.json"
import { useHistory } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

import { useRemix } from "../../../hooks"
import { debug, defaultTransactionValues } from "../../../utils"
import { ethers, utils } from "ethers"
import { useContract } from "../hooks/useContract"
import { FormItem } from "../components"
import { useStep } from "../hooks"
import { SuccessMessage, ErrorMessage } from "../components"
import { Button, StyledButton } from "../../../components"

interface FormProps {
  priceIdentifier: string
}

const initialValues: FormProps = {
  priceIdentifier: "",
}

enum MODE {
  SelectPriceIdentifier = "SelectPriceIdentifier",
  DeployPriceIdentifier = "DeployPriceIdentifier"
}

export const DeployPriceIdentifier: React.FC = () => {
  const { priceIdentifiers, setSelectedPriceIdentifier, selectedPriceIdentifier } = useContract()
  const [mode, setMode] = useState(MODE.SelectPriceIdentifier)
  const { getNextStep, goNextStep } = useStep()
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

  return (
    <React.Fragment>
      {mode === MODE.SelectPriceIdentifier &&
        <React.Fragment>
          <h4>Select price identifier</h4>
          <Form>
            <Row>
              <Col md={9}>
                <Form.Control as="select" value={selectedPriceIdentifier || "0"} disabled={priceIdentifiers.length === 0} onChange={handleSelectChange}>
                  {priceIdentifiers.length === 0 && <option value="0">No price identifiers</option>}
                  {priceIdentifiers.length > 0 && priceIdentifiers.map((item, index) => {
                    return (<option key={index} value={item}>{item}</option>)
                  })}
                </Form.Control>
              </Col>
              <BootstrapButton size="sm" variant="primary" onClick={handleOnDeployClick}>
                <FontAwesomeIcon icon={faPlus} />
              </BootstrapButton>{' '}
            </Row>

            <div style={{ marginTop: "1em" }}>
              <StyledButton
                isLoading={false}
                disabled={selectedPriceIdentifier === ""}
                variant="success"
                onClick={handleOnNextClick}>Next</StyledButton>
            </div>

          </Form>

        </React.Fragment>}

      {mode === MODE.DeployPriceIdentifier &&
        <DeployPriceIdentifierView onCancelCallback={handleOnCancelClick} onSuccessCallback={onSuccessCallback} />}

    </React.Fragment>
  )
}

interface DeployPriceIdentifierViewProps {
  onCancelCallback: () => void
  onSuccessCallback: () => void
}

const DeployPriceIdentifierView: React.FC<DeployPriceIdentifierViewProps> = ({ onCancelCallback, onSuccessCallback }) => {
  const { getContractAddress, setSelectedPriceIdentifier } = useContract()
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
          }, 2400);
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
        }
        }
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <FormikForm>
            <FormItem
              label="Price Identifier"
              field="priceIdentifier"
              placeHolder="ETH/USD"
            />

            {!priceIdentifierHasBeenCreated && <div style={{ display: "flex", justifyContent: "space-between", paddingRight: "2.5em", marginTop: "0em", marginBottom: "2em" }}>
              <Button
                variant="primary"
                type="submit"
                size="sm"
                disabled={isSubmitting}
                isLoading={isSubmitting}
                loadingText="Deploying..."
                text="Deploy"
              />

              <Button
                variant="danger"
                size="sm"
                isLoading={false}
                loadingText=""
                text="Cancel"
                onClick={onCancelCallback}
              />
            </div>}

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