import React, { useEffect, useState } from "react"
import { Formik, FormikErrors, Form as FormikForm } from "formik"

import { BigNumber, ethers } from "ethers"
import { toWei } from "web3-utils"

import TestnetERC20Artifact from "@uma/core/build/contracts/TestnetERC20.json"
import AddressWhitelistArtifact from "@uma/core/build/contracts/AddressWhitelist.json"

import { debug, defaultTransactionValues } from "../../../utils"
import { useRemix, useUMARegistry } from "../../../hooks"
import { Button, StyledButton } from "../../../components"

import { useContract, useStep } from "../hooks"
import { FormItem } from "../components"
import { SuccessMessage, ErrorMessage } from "../components"
import { Form, Button as BootstrapButton, Row, Col } from "react-bootstrap"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useHistory } from "react-router-dom"
import { DELAY_AFTER_FORM_CREATION } from "../../../constants"

interface FormProps {
  name: string
  symbol: string
  decimals: string
  totalSupply: string
}

const initialValues: FormProps = {
  name: "",
  symbol: "",
  decimals: "",
  totalSupply: "",
}

enum MODE {
  SelectCollateralToken = "SelectCollateralToken",
  DeployCollateralToken = "DeployCollateralToken"
}

export const DeployCollateralToken: React.FC = () => {
  const { collateralTokens, selectedCollateralToken, setSelectedCollateralToken } = useContract()
  const [mode, setMode] = useState(MODE.SelectCollateralToken)
  const { getNextStep, goNextStep } = useStep()
  const history = useHistory()

  const handleOnDeployClick = () => {
    setMode(MODE.DeployCollateralToken)
  }

  const handleOnCancelClick = () => {
    setMode(MODE.SelectCollateralToken)
  }

  const onSuccessCallback = () => {
    setMode(MODE.SelectCollateralToken)
  }

  const handleSelectChange = (e: any) => {
    const selectedToken = collateralTokens.find((s) => s.address === e.target.value)
    if (selectedToken) {
      setSelectedCollateralToken(selectedToken)
    }
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
      {mode === MODE.SelectCollateralToken &&
        <React.Fragment>
          <h4>Select collateral token</h4>
          <Form>
            <Row>
              <Col md={10}>
                <Form.Control as="select" disabled={collateralTokens.length === 0} onChange={handleSelectChange} value={selectedCollateralToken?.address || "0"}>
                  {collateralTokens.length === 0 && <option>No collateral tokens</option>}
                  <option value="0">Select an option</option>
                  {collateralTokens.length > 0 && collateralTokens.map((item, index) => {
                    return (<option key={index} value={item.address}>{item.name}</option>)
                  })}
                </Form.Control>
              </Col>
              <BootstrapButton size="sm" variant="primary" onClick={handleOnDeployClick}>
                <FontAwesomeIcon icon={faPlus} />
              </BootstrapButton>{' '}
            </Row>

            <div style={{ marginTop: "1em" }}>
              <StyledButton
                disabled={selectedCollateralToken === undefined}
                variant="success"
                onClick={handleOnNextClick}>Next</StyledButton>
            </div>

          </Form>

        </React.Fragment>}

      {mode === MODE.DeployCollateralToken &&
        <DeployCollateralView onCancelCallback={handleOnCancelClick} onSuccessCallback={onSuccessCallback} />}

    </React.Fragment>
  )
}

interface DeployCollateralViewProps {
  onCancelCallback: () => void
  onSuccessCallback: () => void
}

const DeployCollateralView: React.FC<DeployCollateralViewProps> = ({ onCancelCallback, onSuccessCallback }) => {
  const { clientInstance, web3Provider, signer } = useRemix()
  const { setSelectedCollateralToken } = useContract()
  const { getContractAddress } = useUMARegistry()

  const [newCollateralTokenAddress, setNewCollateralTokenAddress] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [tokenHasBeenCreated, setTokenHasBeenCreated] = useState(false)

  const handleSubmit = (values: FormProps, { setSubmitting, resetForm }) => {
    debug("Deploying collateral token", values)
    setError(undefined)

    const sendTx = async () => {
      const newToken = {
        name: values.name,
        symbol: values.symbol,
        decimals: parseInt(values.decimals, 10),
        totalSupply: values.totalSupply,
      }

      const accounts = await web3Provider.listAccounts()
      debug("accounts", accounts)

      const testnetERC20Factory = new ethers.ContractFactory(
        TestnetERC20Artifact.abi,
        TestnetERC20Artifact.bytecode,
        signer
      )
      const collateralTokenContract = await testnetERC20Factory.deploy(
        newToken.name,
        newToken.symbol,
        newToken.decimals
      )

      await collateralTokenContract.deployTransaction.wait()
      const TestnetErc20Address = collateralTokenContract.address

      debug("collateral token deployed", TestnetErc20Address)

      // TODO: Add a new hook to store addresses..
      // addContractAddress("TestnetErc20Address", TestnetErc20Address)

      const address = getContractAddress("AddressWhitelist")
      debug("AddressWhitelist address", address)

      const whitelistInterface = new ethers.utils.Interface(AddressWhitelistArtifact.abi)
      const addToWhitelistEncodedData = whitelistInterface.encodeFunctionData("addToWhitelist", [TestnetErc20Address])
      await clientInstance.udapp.sendTransaction({
        ...defaultTransactionValues,
        data: addToWhitelistEncodedData,
        from: accounts[0],
        to: address,
      })
      debug("Collateral added to whitelist")

      const newTokenParsed = {
        ...newToken,
        totalSupply: BigNumber.from(newToken.totalSupply),
        address: TestnetErc20Address,
      }

      setNewCollateralTokenAddress(TestnetErc20Address as string)

      await collateralTokenContract.allocateTo(accounts[0], toWei(`${values.totalSupply}`))

      // await updateBalances(signer, accounts[0])

      setSelectedCollateralToken(newTokenParsed)
    }

    setTimeout(() => {
      sendTx()
        .then(() => {
          setSubmitting(false)
          setTokenHasBeenCreated(true)
          resetForm()
          setTimeout(() => {
            onSuccessCallback()
          }, DELAY_AFTER_FORM_CREATION);
        })
        .catch((e) => {
          console.log("Error", e)
          setSubmitting(false)
          setError(e.message.replace("VM Exception while processing transaction: revert", "").trim())
        })
    }, 2000)
  }

  return (
    <React.Fragment>
      <h4>Deploy collateral token</h4>
      <Formik
        initialValues={initialValues}
        validate={(values) => {
          return new Promise(async (resolve, reject) => {
            const errors: FormikErrors<FormProps> = {}
            if (!values.name) {
              errors.name = "Required"
            }
            if (!values.symbol) {
              errors.symbol = "Required"
            }
            if (!values.decimals) {
              errors.decimals = "Required"
            } else if (parseInt(values.decimals, 10) > 255) {
              errors.decimals = "Max value is 255"
            } else if (parseInt(values.decimals, 10) < 0) {
              errors.decimals = "Value cannot be negative"
            }

            if (!values.totalSupply) {
              errors.totalSupply = "Required"
            } else if (parseInt(values.totalSupply, 10) < 0) {
              errors.totalSupply = "Value cannot be negative"
            }
            resolve(errors)
          })
        }
        }
        onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <FormikForm>
            <FormItem label="Name" field="name" placeHolder="WETH" />

            <FormItem label="Symbol" field="symbol" placeHolder="WETH" />

            <FormItem
              label="Decimals"
              field="decimals"
              placeHolder="18"
              type="number"
              showhelp={true}
              helptext="The number of decimals used by this token"
            />

            <FormItem
              label="Initial Supply"
              field="totalSupply"
              showhelp={true}
              type="number"
              helptext="The initial number of collateral tokens that are going to be minted and assigned to you"
            />


            {!tokenHasBeenCreated && <div style={{ display: "flex", justifyContent: "space-between", paddingRight: "2.5em", marginTop: "1em", marginBottom: "2em" }}>

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
            </div>}

            <SuccessMessage show={tokenHasBeenCreated}>
              You have successfully deployed the collateral token at {newCollateralTokenAddress}.
            </SuccessMessage>
            <ErrorMessage show={error !== undefined}>{error}</ErrorMessage>
          </FormikForm>
        )}
      </Formik>
    </React.Fragment>
  )
}

