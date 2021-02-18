import React, { useEffect, useState } from "react"
import Card from "react-bootstrap/Card"
import styled from "styled-components"

import TestnetERC20Artifact from "@uma/core/build/contracts/TestnetERC20.json"

import { useRemix } from "../../../hooks"
import { debug } from "../../../utils"

import { useContract } from "../hooks"
import { BigNumber, ethers } from "ethers"
import { formatUnits } from "ethers/lib/utils"

const Paragraph = styled.p`
  font-size: 0.9em;
  color: ${(props) => props.theme.modalFontColor};
  font-weight: 300;
`

export const RightPanel: React.FC = () => {
  const { clientInstance, signer } = useRemix()
  const [account, setAccount] = useState("")
  const { selectedCollateralToken, selectedPriceIdentifier } = useContract()
  const [collateralBalance, setCollateralBalance] = useState("0")

  useEffect(() => {
    const getAccount = async () => {
      const accounts = await clientInstance.udapp.getAccounts()
      debug("Accounts", accounts)
      setAccount(accounts[0])
    }

    getAccount()
  }, [clientInstance])

  useEffect(() => {
    if (selectedCollateralToken && selectedCollateralToken.address) {
      const getBalance = async () => {
        const testnetERC20Contract = new ethers.Contract(
          selectedCollateralToken.address as string,
          TestnetERC20Artifact.abi,
          signer
        )
        const currentAccount = await signer.getAddress()
        const balance: BigNumber = await testnetERC20Contract.balanceOf(currentAccount)
        setCollateralBalance(`${formatUnits(balance, "ether").toString()}`)
      }
    }
  }, [selectedCollateralToken])
  return (
    <React.Fragment>
      <Paragraph>
        <b>From</b>
      </Paragraph>
      <Paragraph>{account}</Paragraph>
      <Paragraph>
        <b>Collateral Balance</b>
      </Paragraph>
      <Paragraph>{collateralBalance}</Paragraph>
      {selectedCollateralToken && (
        <Card>
          <Card.Header>Selected collateral token</Card.Header>
          <React.Fragment>
            <AccordionContentBody className="borderBottomExceptLast">
              <p style={{ fontWeight: "bold" }}>
                Name: <span style={{ fontWeight: "lighter" }}>{selectedCollateralToken.name}</span>
              </p>
              <p>
                Symbol: <span>{selectedCollateralToken.symbol}</span>
              </p>
              <p>
                Total supply: <span>{selectedCollateralToken.totalSupply.toString()}</span>
              </p>
              <p>
                Address: <span style={{ fontSize: "0.8em" }}>{selectedCollateralToken.address}</span>
              </p>
            </AccordionContentBody>
          </React.Fragment>
        </Card>
      )}
      {selectedPriceIdentifier && (
        <Card>
          <Card.Header>Selected price identifier</Card.Header>
          <React.Fragment>
            <AccordionContentBody direction="horizontal">
              <Image>{selectedPriceIdentifier.charAt(0)}</Image>
              <Description style={{ justifyContent: "center" }}>
                <span>{selectedPriceIdentifier}</span>
              </Description>
            </AccordionContentBody>
          </React.Fragment>
        </Card>
      )}
    </React.Fragment>
  )
}

const AccordionContentBody = styled.div<{ direction?: string }>`
  display: flex;
  padding: 0.5em 1em;
  flex-direction: ${(props) => props.direction || "column"};
`

const Image = styled.div`
  display: flex;
  background-color: #007bff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  color: white;
  margin-right: 1em;
`

const Description = styled.div`
  display: flex;
  width: 70%;
  flex-direction: column;
  font-weight: 400;
  span.subtitle {
                          font - size: 0.85em;
    font-weight: 300;
  }
`
