import { BigNumberish, ethers } from "ethers";

export const fromWei = ethers.utils.formatUnits;

export const weiToNum = (x: BigNumberish, u = 18) => parseFloat(fromWei(x, u));