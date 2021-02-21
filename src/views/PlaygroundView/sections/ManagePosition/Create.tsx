import React, { useState } from "react"
import { Box, Grid } from "@material-ui/core"
import { Formik, Form, FormikErrors } from "formik"
import { BigNumber, ethers } from "ethers"

import { useEMPProvider, useUMARegistry, useWeb3Provider } from "../../../../hooks"
import { fromWei, toWeiSafe } from "../../../../utils"

import { useGlobalState } from "../../hooks"
import { ErrorMessage, FormItem, SuccessMessage } from "../../components"
import { Button, Loader } from "../../../../components"
import { EMPState, TokenState } from "../../../../types"

interface FormProps {
  syntheticTokens: number
  collateralAmount: number
}

const initialValues: FormProps = {
  syntheticTokens: 0,
  collateralAmount: 0,
}

export const Create: React.FC<{}> = () => {
  const { signer } = useWeb3Provider()
  const { selectedEMPAddress } = useGlobalState()
  const { empState, collateralState, syntheticState } = useEMPProvider()
  const { getContractInterface } = useUMARegistry()

  // const [tokens, setTokens] = useState<string>("0")

  const [error, setError] = useState<string | undefined>(undefined)
  const [successful, setIsSuccessful] = useState(false)

  if (empState && collateralState && syntheticState) {


    const {
      symbol: collateralSymbol,
      totalSupply,
      decimals: collateralDecimals,
      allowance: collateralAllowance,
    } = collateralState
    const { collateralRequirement, priceIdentifier, minSponsorTokens } = empState
    const { symbol: tokenSymbol, decimals: syntheticdecimals, setMaxAllowance } = syntheticState

    // if (collateralRequirement && priceIdentifier && minSponsorTokens && totalSupply && collateralDecimals && syntheticdecimals && collateralDecimals) {
    const minSponsorTokensFromWei = parseFloat(fromWei(minSponsorTokens, syntheticdecimals))
    const collateralRequirementFromWei = parseFloat(fromWei(collateralRequirement, collateralDecimals))
    const needAllowance = collateralAllowance !== "Infinity"
    // const tokensToCreate = Number(tokens) || 0;
    // const resultantCollateral = posCollateral + collateralToDeposit;
    // const resultantTokens = posTokens + tokensToCreate;
    // const resultantTokensBelowMin = resultantTokens < minSponsorTokensFromWei && resultantTokens !== 0;

    const handleSubmit = (values: FormProps, { setSubmitting }) => {
      setError(undefined)
      setIsSuccessful(false)
      const createPosition = async () => {
        const contract = new ethers.Contract(
          selectedEMPAddress,
          getContractInterface("ExpiringMultiParty") as ethers.utils.Interface,
          signer
        )

        console.log(
          "params",
          { rawValue: toWeiSafe(`${values.collateralAmount}`, collateralDecimals) },
          { rawValue: toWeiSafe(`${values.syntheticTokens}`, syntheticdecimals) }
        )

        const receipt = await contract.create(
          { rawValue: toWeiSafe(`${values.collateralAmount}`, collateralDecimals) },
          { rawValue: toWeiSafe(`${values.syntheticTokens}`, syntheticdecimals) }
        )

        await receipt.wait()
      }

      createPosition()
        .then(() => {
          setSubmitting(false)
          setIsSuccessful(true)

          setTimeout(() => {
            setIsSuccessful(false)
          }, 3000);
        })
        .catch((e) => {
          console.log("error", e)
          setSubmitting(false)
          setError(e.message.replace("VM Exception while processing transaction: revert", "").trim())
        })
    }

    return (
      <Box>
        <Grid container={true} spacing={3} style={{ marginBottom: "0.5em" }}>
          <Grid item={true} md={4} sm={6} xs={12}>
            <Formik
              initialValues={initialValues}
              validate={(values) => {
                return new Promise((resolve, reject) => {
                  const errors: FormikErrors<FormProps> = {}
                  if (!values.collateralAmount) {
                    errors.collateralAmount = "Required"
                  } else if (values.collateralAmount < 0) {
                    errors.collateralAmount = "Value cannot be negative"
                  } else if (values.collateralAmount / values.syntheticTokens < minSponsorTokensFromWei / 100) {
                    errors.collateralAmount = `The collateral requirement is ${collateralRequirementFromWei} %`
                  } else if (BigNumber.from(values.collateralAmount).gt(totalSupply)) {
                    errors.collateralAmount = `The collateral desired is bigger than the total supply`
                  }

                  if (!values.syntheticTokens) {
                    errors.syntheticTokens = "Required"
                  } else if (values.syntheticTokens < minSponsorTokensFromWei) {
                    errors.syntheticTokens = `Value should be higher than ${minSponsorTokensFromWei}` // TO BE CONFIGURED via call to get the value..
                  }

                  resolve(errors)
                })
              }}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <FormItem
                    key="syntheticTokens"
                    label={`Tokens (${tokenSymbol})`}
                    field="syntheticTokens"
                    labelWidth={3}
                    placeHolder="Amount of synthetic tokens (i.e 100)"
                  />

                  <FormItem
                    key="collateralAmount"
                    label={`Collateral (${collateralSymbol})`}
                    field="collateralAmount"
                    labelWidth={3}
                    placeHolder="Amount of collateral (i.e. 150)"
                  />

                  <Button
                    variant="primary"
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    isloading={isSubmitting}
                    loadingText="Creating Position..."
                    text="Create Position"
                  />
                </Form>
              )}
            </Formik>
          </Grid>
        </Grid>

        <SuccessMessage show={successful}>You have successfully minted new synthetic tokens.</SuccessMessage>
        <ErrorMessage show={error !== undefined}>{error}</ErrorMessage>

      </Box>
    )
  } else {
    return <Loader />
  }
}
