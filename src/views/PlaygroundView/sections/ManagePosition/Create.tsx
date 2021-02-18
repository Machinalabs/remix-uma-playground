import React, { useState } from "react"
import { Box, Button, Grid, InputAdornment, TextField, Tooltip, Typography } from "@material-ui/core"
import styled from "styled-components"

import { useEMPData, useToken } from "../../../../hooks"
import { fromWei } from "../../../../utils"

import { useContract } from "../../hooks"

const MinLink = styled.div`
  text-decoration-line: underline;
`

export const Create: React.FC<{}> = () => {
  const { selectedEMPAddress } = useContract()
  const { state: empState } = useEMPData(selectedEMPAddress)
  const { symbol: tokenSymbol, decimals: tokenDecimals } = useToken(empState.tokenCurrency)

  const { collateralRequirement, priceIdentifier, minSponsorTokens } = empState

  const [tokens, setTokens] = useState<string>("0")

  if (collateralRequirement && priceIdentifier && minSponsorTokens) {
    // const minSponsorTokensFromWei = parseFloat(fromWei(minSponsorTokens, tokenDecimals));
    // const tokensToCreate = Number(tokens) || 0;
    // const resultantCollateral = posCollateral + collateralToDeposit;
    // const resultantTokens = posTokens + tokensToCreate;
    // const resultantTokensBelowMin = resultantTokens < minSponsorTokensFromWei && resultantTokens !== 0;

    return (
      <Box>
        <Grid container={true} spacing={3}>
          <Grid item={true} md={4} sm={6} xs={12}>
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
  } else {
    return (
      <Box py={2}>
        <Typography>
          <i>Please select an EMP from the dropdown above.</i>
        </Typography>
      </Box>
    )
  }
}
