import React, { useState } from "react"
import { Box, Grid } from "@material-ui/core"
import { Formik, Form, FormikErrors } from "formik"

import { useEMPProvider, usePosition, useWeb3Provider } from "../../../../hooks"
import { toWeiSafe } from "../../../../utils"
import { ErrorMessage, FormItem, SuccessMessage } from "../../components"
import { Button, Loader } from "../../../../components"

interface FormProps {
  syntheticTokens: number
}

const initialValues: FormProps = {
  syntheticTokens: 0,
}

export const Redeem: React.FC<{}> = () => {
  const { address } = useWeb3Provider()
  const { empState, syntheticState, instance } = useEMPProvider()
  const [error, setError] = useState<string | undefined>(undefined)
  const positionData = usePosition(address)
  const [successful, setIsSuccessful] = useState(false)

  if (syntheticState && empState && positionData) {
    const {
      symbol: syntheticSymbol,
      totalSupply: syntheticTotalSupply,
      decimals: syntheticDecimals,
      allowance: syntheticAllowance,
      instance: syntheticInstance
    } = syntheticState

    const handleSubmit = (values: FormProps, { setSubmitting }) => {
      setError(undefined)

      const sendTx = async () => {
        const syntheticTokens = toWeiSafe(`${values.syntheticTokens}`, syntheticDecimals)

        await syntheticInstance.approve(instance.address, syntheticTokens)

        const receipt = await instance.redeem({ rawValue: syntheticTokens })

        await receipt.wait()
      }

      setTimeout(() => {
        sendTx()
          .then(() => {
            setSubmitting(false)
            setIsSuccessful(true)

            setTimeout(() => {
              setIsSuccessful(false)
            }, 3000);
          })
          .catch((e: Error) => {
            console.log(e)
            setSubmitting(false)
            setError(e.message.replace("VM Exception while processing transaction: revert", "").trim())
          })
      }, 1000)
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

                  if (!values.syntheticTokens) {
                    errors.syntheticTokens = "Required"
                  } else if (parseInt(`${values.syntheticTokens}`, 10) < 0) {
                    errors.syntheticTokens = "Value cannot be negative"
                  } else if (
                    parseInt(`${values.syntheticTokens}`, 10) > parseInt(`${positionData.syntheticTokens}`, 10) // TODO: verify conversions
                  ) {
                    errors.syntheticTokens = "The number exceed the available synthetic tokens"
                  }

                  resolve(errors)
                })
              }
              }
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <FormItem
                    key="syntheticTokens"
                    label={`Tokens (${syntheticSymbol})`}
                    field="syntheticTokens"
                    labelWidth={3}
                    type="number"
                    placeHolder="Amount of synthetic tokens (i.e 100)"
                  />

                  <Button
                    variant="primary"
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    isloading={isSubmitting}
                    loadingText="Redeeming..."
                    text="Redeem"
                  />

                </Form>
              )}

            </Formik>
          </Grid>
        </Grid>

        <SuccessMessage show={successful}>You have successfully redeemed tokens.</SuccessMessage>
        <ErrorMessage show={error !== undefined}>{error}</ErrorMessage>

      </Box >)
  } else {
    return <Loader />
  }
}
