import React, { useState } from "react"
import { Formik, Form, FormikErrors } from "formik"
import { BigNumber, ethers, utils } from "ethers"
import { hexToAscii, toWei } from "web3-utils"
import "react-datetime/css/react-datetime.css"

import TestnetERC20Artifact from "@uma/core/build/contracts/TestnetERC20.json"
import ExpiringMultiPartyCreatorArtifact from "@uma/core/build/contracts/ExpiringMultiPartyCreator.json"
import MockOracleArtifact from "@uma/core/build/contracts/MockOracle.json"
import FinderArtifact from "@uma/core/build/contracts/Finder.json"

import { debug } from "../../../utils"
import { useGlobalState, useStep } from "../hooks"
import { Button, StyledButton } from "../../../components"
import { ErrorMessage, FormItem, SuccessMessage } from "../components"
import { useRemix, useUMARegistry } from "../../../hooks"
import { InterfaceName } from "../../../types"
import { useHistory } from "react-router-dom"
import { DELAY_AFTER_FORM_CREATION } from "../../../constants"

interface FormProps {
  expirationTimestamp: string
  syntheticName: string
  syntheticSymbol: string
  collateralRequirement: string
  disputeBond: string
  minSponsorTokens: string
  withdrawalLiveness: string
  liquidationLiveness: string
}

const initialValues: FormProps = {
  expirationTimestamp: "",
  syntheticName: "",
  syntheticSymbol: "",
  collateralRequirement: "",
  disputeBond: "",
  minSponsorTokens: "",
  withdrawalLiveness: "",
  liquidationLiveness: "",
}

interface Props {
  onCreatedCallback: () => void
}

export const CreateExpiringMultiParty: React.FC<Props> = ({ onCreatedCallback }) => {
  const { clientInstance, web3Provider, signer } = useRemix()
  const { selectedPriceIdentifier, selectedCollateralToken, setSelectedEMPAddress } = useGlobalState()
  const { getContractAddress } = useUMARegistry()

  const { setCurrentStepCompleted, getStepBefore, goStepBefore } = useStep()
  const [newEMPAddress, setNewEMPAddress] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [empHasBeenCreated, setEMPHasBeenCreated] = useState(false)

  const handleSubmit = (values: FormProps, { setSubmitting }) => {
    setError(undefined)

    const sendTx = async () => {
      debug("Values", values)

      const accounts = await web3Provider.listAccounts()
      debug("Accounts", accounts[0])

      const storeAddress = getContractAddress("Store") as string
      const collateralTokenAddress = selectedCollateralToken?.address as string // collateralTokens[0].address as string
      debug("Collateral address", collateralTokenAddress)

      const collateralTokenInterface = new ethers.utils.Interface(TestnetERC20Artifact.abi)
      const tokenContract = new ethers.Contract(collateralTokenAddress, collateralTokenInterface, signer)
      debug("tokenContract", tokenContract)
      const balance = await tokenContract.balanceOf(accounts[0], { from: await signer.getAddress() })
      debug("Balance", balance)

      let txn

      try {
        const dateTimestamp = values.expirationTimestamp
        const expiringMultiPartyCreatorAddress = getContractAddress("ExpiringMultiPartyCreator")
        if (!expiringMultiPartyCreatorAddress) {
          throw new Error("UMARegistryProvider not defined")
        }
        debug("expiringMultiPartyCreatorAddress", expiringMultiPartyCreatorAddress)

        const identifierBytes = utils.formatBytes32String(selectedPriceIdentifier)
        debug("price identifier", identifierBytes)

        const expiringMultipartyCreatorInterface = new ethers.utils.Interface(ExpiringMultiPartyCreatorArtifact.abi)
        const mockOracleFactory = new ethers.ContractFactory(
          MockOracleArtifact.abi,
          MockOracleArtifact.bytecode,
          signer
        )
        const mockOracleContract = await mockOracleFactory.deploy(
          getContractAddress("Finder"),
          getContractAddress("Timer")
        )
        await mockOracleContract.deployTransaction.wait()
        debug("Mock Oracle deployed")

        const mockOracleInterfaceName = utils.formatBytes32String(InterfaceName.Oracle)
        const finderAddress = getContractAddress("Finder")
        if (!finderAddress) {
          throw new Error("UMARegistry provider not defined")
        }
        const finderContract = new ethers.Contract(finderAddress, FinderArtifact.abi, signer)
        await finderContract.changeImplementationAddress(mockOracleInterfaceName, mockOracleContract.address)
        debug("Implementation updated")

        const params = {
          expirationTimestamp: BigNumber.from(dateTimestamp),
          collateralAddress: collateralTokenAddress,
          priceFeedIdentifier: identifierBytes,
          syntheticName: values.syntheticName,
          syntheticSymbol: values.syntheticSymbol,
          collateralRequirement: {
            rawValue: toWei(`${parseInt(values.collateralRequirement, 10) / 100}`),
          },
          disputeBondPct: {
            rawValue: toWei("0.1"),
          },
          sponsorDisputeRewardPct: {
            rawValue: toWei("0.1"),
          },
          disputerDisputeRewardPct: {
            rawValue: toWei("0.1"),
          },
          minSponsorTokens: {
            rawValue: toWei(`${values.minSponsorTokens}`),
          },
          liquidationLiveness: BigNumber.from(values.liquidationLiveness),
          withdrawalLiveness: BigNumber.from(values.withdrawalLiveness),
          excessTokenBeneficiary: storeAddress,
        }

        debug("Params", params)

        const expiringMultipartyCreator = new ethers.Contract(
          expiringMultiPartyCreatorAddress,
          expiringMultipartyCreatorInterface,
          signer
        )
        const expiringMultiPartyAddress = await expiringMultipartyCreator.callStatic.createExpiringMultiParty(params)
        debug("ExpiringMultiPartyAddress", expiringMultiPartyAddress)
        setNewEMPAddress(expiringMultiPartyAddress)
        // TODO: Create hook to add addresses
        // addContractAddress("ExpiringMultiParty", expiringMultiPartyAddress)
        txn = await expiringMultipartyCreator.createExpiringMultiParty(params)
        debug("transaction", txn)

        const receipt = await txn.wait()
        debug("Receipt", receipt)

        const collateralToken = new ethers.Contract(collateralTokenAddress, TestnetERC20Artifact.abi, signer)
        debug("Total supply", await collateralToken.totalSupply())
        await collateralToken.approve(expiringMultiPartyAddress, await collateralToken.totalSupply())
        debug("Approved EMP allowance on collateral")
        setSelectedEMPAddress(expiringMultiPartyAddress)
        setEMPHasBeenCreated(true)
      } catch (error) {
        debug("Error", error)
        const traces = await clientInstance.call("debugger" as any, "getTrace", txn.hash).catch((err) => {
          debug("error", err)
        })
        debug("traces", traces)
        const humanReadableError = traces.structLogs[traces.structLogs.length - 1]
        console.log(hexToAscii(`0x${humanReadableError.memory.join("")}`))
      }
    }
    setTimeout(() => {
      sendTx()
        .then(() => {
          setSubmitting(false)
          setCurrentStepCompleted()
          setTimeout(() => {
            onCreatedCallback()
          }, DELAY_AFTER_FORM_CREATION)
        })
        .catch((e) => {
          debug(e)
          setSubmitting(false)
          setError(e.message.replace("VM Exception while processing transaction: revert", "").trim())
        })
    }, 500)
  }

  const history = useHistory()

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
      <h4>Create a expiring multiparty synthethic contract</h4>
      <Formik
        initialValues={initialValues}
        validate={(values) => {
          const errors: FormikErrors<FormProps> = {}
          if (!values.expirationTimestamp) {
            errors.expirationTimestamp = "Required"
          }

          if (!values.syntheticName) {
            errors.syntheticName = "Required"
          }

          if (!values.syntheticSymbol) {
            errors.syntheticSymbol = "Required"
          }

          if (!values.collateralRequirement) {
            errors.collateralRequirement = "Required"
          } else if (parseInt(values.collateralRequirement, 10) < 100) {
            errors.collateralRequirement = "Value should be higher than 100"
          }

          if (!values.minSponsorTokens) {
            errors.minSponsorTokens = "Required"
          } else if (parseInt(values.minSponsorTokens, 10) < 0) {
            errors.minSponsorTokens = "Value cannot be negative"
          }

          if (!values.withdrawalLiveness) {
            errors.withdrawalLiveness = "Required"
          } else if (parseInt(values.withdrawalLiveness, 10) < 0) {
            errors.withdrawalLiveness = "Value cannot be negative"
          }

          if (!values.liquidationLiveness) {
            errors.liquidationLiveness = "Required"
          } else if (parseInt(values.liquidationLiveness, 10) < 0) {
            errors.liquidationLiveness = "Value cannot be negative"
          }

          return errors
        }}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <FormItem
              customClass="custom"
              key="expirationTimestamp"
              label="Expiration timestamp"
              field="expirationTimestamp"
              labelWidth={3}
              placeHolder="Timestamp (seconds)"
              showhelp={true}
              isDate={true}
              helptext="Unix timestamp of when the contract will expire."
            />

            <FormItem
              key="syntheticName"
              label="Synthetic name"
              field="syntheticName"
              labelWidth={3}
              placeHolder="Synthetic Token"
            />

            <FormItem
              key="syntheticSymbol"
              label="Synthetic symbol"
              field="syntheticSymbol"
              labelWidth={3}
              placeHolder="SNT"
            />

            <FormItem
              key="collateralRequirement"
              label="Collateral requirement (%)"
              field="collateralRequirement"
              labelWidth={3}
              placeHolder="Percentage required (i.e. 125)"
              type="number"
            />

            <FormItem
              key="minSponsorTokens"
              label="Minimum sponsor tokens"
              field="minSponsorTokens"
              labelWidth={3}
              placeHolder="100"
              type="number"
              showhelp={true}
              helptext="Minimum number of tokens in a sponsor's position."
            />

            <FormItem
              key="withdrawalLiveness"
              label="Withdrawal liveness (in seconds)"
              field="withdrawalLiveness"
              labelWidth={3}
              placeHolder="7200"
              type="number"
              showhelp={true}
              helptext="Liveness delay, in seconds, for pending withdrawals."
            />

            <FormItem
              key="liquidationLiveness"
              label="Liquidation liveness (in seconds)"
              field="liquidationLiveness"
              labelWidth={3}
              placeHolder="7200"
              type="number"
              showhelp={true}
              helptext="Amount of time in seconds for pending liquidation before expiry."
            />

            {!empHasBeenCreated && (
              <div style={{ display: "flex", paddingRight: "2.5em", marginTop: "1em", marginBottom: "2em" }}>
                <Button
                  variant="primary"
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  isloading={isSubmitting}
                  loadingText="Creating..."
                  text="Create"
                />

                <StyledButton variant="link" onClick={handleOnBackClick}>
                  Back
                </StyledButton>
              </div>
            )}

            <SuccessMessage show={empHasBeenCreated}>
              You have successfully deployed the expiring multiparty contract {newEMPAddress}
            </SuccessMessage>
            <ErrorMessage show={error !== undefined}>{error}</ErrorMessage>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  )
}
