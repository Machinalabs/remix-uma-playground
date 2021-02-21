import { BigNumberish, ethers } from "ethers"
import { utils } from "ethers"
const { parseUnits: toWei } = utils

export const fromWei = ethers.utils.formatUnits

export const weiToNum = (x: BigNumberish, u = 18) => parseFloat(fromWei(x, u))

export const toNumberAsString = (x: number) => `${x}`

const DEFAULT_PRECISION = 18

// `toWeiSafe()` should always be used to convert floats into wei values
// before passing the result as a transaction arg, as Solidity cannot deal with non-Integers.
// If the argument to pass into `toWei()` has too much precision (specifically more than `precisionToUse`),
// then `toWei()` might return a string number with decimals, which Solidity cannot handle.
export function toWeiSafe(numberToConvertToWei: string, desiredPrecision?: number) {
  const precisionToUse = desiredPrecision ? desiredPrecision : DEFAULT_PRECISION

  // Try converting just the raw string first to avoid unneccessary stripping of precision.
  try {
    return toWei(numberToConvertToWei, precisionToUse)
  } catch (err) {
    // This shouldn't throw an error, and if it does then its unexpected and we want to know about it.
    return toWei(Number(numberToConvertToWei).toFixed(precisionToUse), precisionToUse)
  }
}
