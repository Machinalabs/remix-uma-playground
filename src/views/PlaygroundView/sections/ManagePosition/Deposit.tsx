import React, { useState } from "react"
import { Box, Grid } from "@material-ui/core"
import { Formik, Form, FormikErrors } from "formik"
import { BigNumber } from "ethers"

import { useEMPProvider } from "../../../../hooks"
import { toWeiSafe } from "../../../../utils"
import { ErrorMessage, FormItem, SuccessMessage } from "../../components"
import { Button, Loader } from "../../../../components"

interface FormProps {
  collateralAmount: number
}

const initialValues: FormProps = {
  collateralAmount: 0,
}

export const Deposit: React.FC<{}> = () => {
  const { collateralState, instance } = useEMPProvider()
  const [error, setError] = useState<string | undefined>(undefined)
  const [successful, setIsSuccessful] = useState(false)

  if (collateralState) {
    const {
      symbol: collateralSymbol,
      totalSupply: collateralTotalSupply,
      decimals: collateralDecimals,
    } = collateralState

    const handleSubmit = (values: FormProps, { setSubmitting }) => {
      setError(undefined)
      setIsSuccessful(false)

      const sendTx = async () => {
        const receipt = await instance.deposit({
          rawValue: toWeiSafe(`${values.collateralAmount}`, collateralDecimals),
        })

        await receipt.wait()
      }

      setTimeout(() => {
        sendTx()
          .then(() => {
            setSubmitting(false)
            setIsSuccessful(true)

            setTimeout(() => {
              setIsSuccessful(false)
            }, 3000)
          })
          .catch((e) => {
            console.log(e)
            setSubmitting(false)
            setError(e.message.replace("VM Exception while processing transaction: revert", "").trim())
          })
      }, 2000)
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
                  } else if (parseInt(`${values.collateralAmount}`, 10) < 0) {
                    errors.collateralAmount = "Value cannot be negative"
                  } else if (BigNumber.from(values.collateralAmount).gt(collateralTotalSupply)) {
                    // TODO: verify conversions
                    errors.collateralAmount = `The collateral desired is bigger than the total supply`
                  }

                  resolve(errors)
                })
              }}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <FormItem
                    key="collateralAmount"
                    label={`Collateral (${collateralSymbol})`}
                    field="collateralAmount"
                    labelWidth={3}
                    type="number"
                    placeHolder="Collateral amount (i.e 100)"
                  />

                  <Button
                    variant="primary"
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    isloading={isSubmitting}
                    loadingText="Depositing..."
                    text="Deposit"
                  />
                </Form>
              )}
            </Formik>
          </Grid>
        </Grid>

        <SuccessMessage show={successful}>You have successfully deposited collateral.</SuccessMessage>
        <ErrorMessage show={error !== undefined}>{error}</ErrorMessage>
      </Box>
    )
  } else {
    return <Loader />
  }
}
