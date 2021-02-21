import React, { useState } from "react"
import { Box, Grid } from "@material-ui/core"
import styled from "styled-components"
import { Formik, Form, FormikErrors } from "formik"
import { BigNumber, ethers } from "ethers"

import { useEMPProvider, useUMARegistry, useWeb3Provider } from "../../../../hooks"
import { fromWei, toWeiSafe } from "../../../../utils"

import { useGlobalState } from "../../hooks"
import { ErrorMessage, FormItem, SuccessMessage } from "../../components"
import { Button, Loader } from "../../../../components"
import { Spinner } from "react-bootstrap"
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
  const { address, signer } = useWeb3Provider()
  const { selectedEMPAddress } = useGlobalState()
  const { empState, collateralState, syntheticState } = useEMPProvider()
  const { getContractInterface } = useUMARegistry()

  const [tokens, setTokens] = useState<string>("0")

  const [error, setError] = useState<string | undefined>(undefined)

  if (!empState && !collateralState && !syntheticState) {
    return <Loader />
  }

  const {
    symbol: collateralSymbol,
    totalSupply,
    decimals: collateralDecimals,
    allowance: collateralAllowance,
  } = collateralState as TokenState
  const { collateralRequirement, priceIdentifier, minSponsorTokens } = empState as EMPState
  const { symbol: tokenSymbol, decimals: syntheticdecimals, setMaxAllowance } = syntheticState as TokenState

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
        { rawValue: toWeiSafe(`${(values.collateralAmount, collateralDecimals)}`) },
        { rawValue: toWeiSafe(`${values.syntheticTokens}`, syntheticdecimals) }
      )

      await receipt.wait()
    }

    createPosition()
      .then(() => {
        setSubmitting(false)
      })
      .catch((e) => {
        console.log("error", e)
        setSubmitting(false)
        setError(e.message.replace("VM Exception while processing transaction: revert", "").trim())
      })
  }

  const setMaxAllowanceHandler = async () => {
    try {
      await setMaxAllowance()
      console.log("seted ")
    } catch (error) {
      console.log("Error setting up max allowance", error)
    }
  }
  return (
    <Box>
      <Grid container={true} spacing={3}>
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

                {needAllowance && (
                  <Button
                    variant="primary"
                    type="button"
                    size="sm"
                    disabled={isSubmitting}
                    isloading={isSubmitting}
                    onClick={setMaxAllowanceHandler}
                    loadingText="Setting max allowance"
                    text="Set Max Allowance"
                  />
                )}
                {!needAllowance && (
                  <Button
                    variant="primary"
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    isloading={isSubmitting}
                    loadingText="Creating Position..."
                    text="Create Position"
                  />
                )}

                <SuccessMessage show={false}>You have successfully created a position.</SuccessMessage>
                <ErrorMessage show={error !== undefined}>{error}</ErrorMessage>
              </Form>
            )}
          </Formik>
          {/* <TextField
                            fullWidth
                            type="number"
                            variant="outlined"
                            label={`Tokens (${tokenSymbol})`}
                            inputProps={{ min: "0" }}
                            value={tokens}
                            error={resultantTokensBelowMin}
                            helperText={
                                resultantTokensBelowMin &&
                                `Below minimum of ${minSponsorTokensFromWei}`
                            }
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setTokens(e.target.value)
                            }
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip
                                            placement="top"
                                            title="Maximum amount of tokens with entered collateral"
                                        >
                                            <Button
                                                fullWidth
                                                onClick={() =>
                                                    setTokensToMax(
                                                        gcr,
                                                        collateralNum,
                                                        resultantCollateral,
                                                        posTokens,
                                                        posCollateral,
                                                        isLegacyEmp
                                                    )
                                                }
                                            >
                                                <MinLink>Max</MinLink>
                                            </Button>
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            }}
                        /> */}
        </Grid>
        {/* <Grid item md={4} sm={6} xs={12}>
                        <TextField
                            fullWidth
                            type="number"
                            variant="outlined"
                            label={`Collateral (${collSymbol})`}
                            inputProps={{ min: "0", max: balance }}
                            value={collateral}
                            error={balanceBelowCollateralToDeposit}
                            helperText={
                                balanceBelowCollateralToDeposit &&
                                `${collSymbol} balance is too low`
                            }
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setCollateral(e.target.value)
                            }
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip
                                            placement="top"
                                            title="Minimum amount of collateral with entered tokens"
                                        >
                                            <Button
                                                fullWidth
                                                onClick={() =>
                                                    setBackingCollateralToMin(
                                                        gcr,
                                                        tokensNum,
                                                        resultantTokens,
                                                        posTokens,
                                                        posCollateral,
                                                        isLegacyEmp
                                                    )
                                                }
                                            >
                                                <MinLink>Min</MinLink>
                                            </Button>
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item md={4} sm={6} xs={12}> 
                        <Box py={0}>
                            {needAllowance && (
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={setMaxAllowance}
                                >
                                    Max Approve
                                </Button>
                            )}
                            {!needAllowance && (
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={mintTokens}
                                    disabled={
                                        cannotMint ||
                                        balanceBelowCollateralToDeposit ||
                                        resultantCRBelowRequirement ||
                                        resultantTokensBelowMin ||
                                        collateralToDeposit < 0 ||
                                        tokensToCreate <= 0
                                    }
                                >
                                    {`Create ${tokensToCreate} ${tokenSymbol} with ${collateralToDeposit} ${collSymbol}`}
                                </Button>
                            )}
                        </Box>
                    </Grid>*/}
      </Grid>
    </Box>

    // 1 input text for number of tokens
    // 1 input for collateral
    //
  )
}
