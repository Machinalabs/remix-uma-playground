export const usePosition = (address: string) => {

    // const { empContract } = useEMPContract()

    // const getPositionInfo = async () => {
    //     // Make contract calls in parallel
    //     const [collRawFixedPoint, position, liquidations] = await Promise.all([
    //         empContract.getCollateral(address),
    //         empContract.positions(address),
    //         empContract.getLiquidations(address),
    //     ]);
    //     const collRaw: BigNumber = collRawFixedPoint[0];

    //     // Reformat data
    //     const tokensOutstanding: BigNumber = position.tokensOutstanding[0];
    //     const withdrawReqAmt: BigNumber = position.withdrawalRequestAmount[0];
    //     const withdrawReqPassTime: BigNumber =
    //         position.withdrawalRequestPassTimestamp;
    //     const xferTime: BigNumber = position.transferPositionRequestPassTimestamp;

    //     const collateral: string = weiToNum(collRaw, collDec);
    //     const backingCollateral: string = weiToNum(
    //         collRaw.sub(withdrawReqAmt),
    //         collDec
    //     );
    //     const tokens: string = weiToNum(tokensOutstanding, tokenDec);
    //     const cRatio =
    //         backingCollateral !== null && tokens !== null
    //             ? Number(tokens) > 0
    //                 ? Number(backingCollateral) / Number(tokens)
    //                 : 0
    //             : null;
    //     const withdrawAmt: string = weiToNum(withdrawReqAmt, collDec);
    //     const withdrawPassTime: number = withdrawReqPassTime.toNumber();
    //     const pendingWithdraw: string =
    //         withdrawReqPassTime.toString() !== "0" ? "Yes" : "No";
    //     const pendingTransfer: string =
    //         xferTime.toString() !== "0" ? "Yes" : "No";

    //     // Only store unexpired liquidations in state
    //     const updatedLiquidations: LiquidationState[] = [];
    //     liquidations.forEach((liq: any, id: number) => {
    //         const liquidationTimeRemaining =
    //             liq.liquidationTime.toNumber() +
    //             liquidationLiveness.toNumber() -
    //             Math.floor(Date.now() / 1000);
    //         if (liquidationTimeRemaining > 0) {
    //             updatedLiquidations.push({
    //                 liquidationId: id,
    //                 liquidationTime: liq.liquidationTime.toNumber(),
    //                 liquidationTimeRemaining: liquidationTimeRemaining,
    //                 liquidator: liq.liquidator,
    //                 liquidatedCollateral: weiToNum(
    //                     liq.liquidatedCollateral[0],
    //                     collDec
    //                 ),
    //                 lockedCollateral: weiToNum(liq.lockedCollateral[0], collDec),
    //                 tokensOutstanding: weiToNum(liq.tokensOutstanding[0], tokenDec),
    //                 state: liq.state,
    //             });
    //         }
    //     });

    //     // // set states
    //     // setCollateral(collateral);
    //     // setBackingCollateral(backingCollateral);
    //     // setTokens(tokens);
    //     // setCRatio(cRatio);
    //     // setWithdrawAmt(withdrawAmt);
    //     // setWithdrawPassTime(withdrawPassTime);
    //     // setPendingWithdraw(pendingWithdraw);
    //     // setPendingTransfer(pendingTransfer);
    //     // setLiquidations(updatedLiquidations);

    // }

    return {

    }
}