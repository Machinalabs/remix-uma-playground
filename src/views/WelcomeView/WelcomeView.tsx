import React, { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import styled from "styled-components"
import Spinner from "react-bootstrap/Spinner"
import Alert from "react-bootstrap/Alert"

import { HOW_TO_PROVIDER_BLACK, HOW_TO_PROVIDER_WHITE, PLAYGROUND_ROUTE } from "../../constants"
import { StyledButton } from "../../components"
import { useRemix, useUMARegistry } from "../../hooks"
import { TITLE } from "../../text"
import { debug } from "../../utils"


export const WelcomeView: React.FC = () => {
  const { clientInstance, web3Provider, themeType } = useRemix()
  const [isStarting, setIsStarting] = useState(false)
  const history = useHistory()
  const [error, setError] = useState<string | undefined>(undefined)
  const { getContractAddress } = useUMARegistry()

  useEffect(() => {
    if (isStarting && clientInstance) {
      const validateAndRedirectIfOk = async () => {
        const provider = await clientInstance.call("network", "getNetworkProvider")
        if (provider === "vm") {
          setError(
            "Invalid provider selected. Please be ensure the provider is correct."
          )
          setIsStarting(false)
          return
        }

        try {
          const network = await clientInstance.call("network", "detectNetwork")
          console.log("Network", network)
        } catch (error) {
          setError(
            "Invalid provider selected. Please be sure you are running the UMA snapshot docker image and the provider is correct."
          )
          setIsStarting(false)
          return
        }

        try {
          // TODO: Verify all contracts...
          const finderAddress = getContractAddress("Finder")
          if (!finderAddress) {
            throw new Error("UMARegistryProvider not defined")
          }
          const finderCode = await web3Provider.getCode(finderAddress)
          debug("finderCode", finderCode)
        } catch (error) {
          setError(
            "UMA snapshot not found. Please be sure you are running the UMA snapshot docker image and the provider is correct."
          )
          setIsStarting(false)
          return
        }

        history.push(`${PLAYGROUND_ROUTE}`)
      }

      setTimeout(() => {
        validateAndRedirectIfOk()
      }, 1000)
    }
  }, [isStarting, clientInstance, history]) // eslint-disable-line

  const handleOnClick = () => {
    setError(undefined)
    setIsStarting(true)
  }

  const getImage = () => {
    if (themeType === "dark") {
      return HOW_TO_PROVIDER_WHITE
    }
    return HOW_TO_PROVIDER_BLACK
  }

  return (
    <Wrapper>
      <h2>{TITLE}</h2>
      <h4 style={{ marginTop: "1em" }}>Create synths easily</h4>
      <h6 style={{ marginTop: "1em" }}>Pre-requisites</h6>
      <p>
        In order to run this playground you need to have docker installed and run the following command: <br />
        <code> $ docker run -it -p 8545:8545 defiacademy/uma-snapshot</code>
        <br />
        Now, you need to setup Remix to use the Web3 provider (Check the image below) <br />
        <img
          alt="explains how to set web3 provider"
          style={{ marginBottom: "1em", marginTop: "1em" }}
          width="700"
          height="700"
          src={getImage()}
        />
      </p>
      <StyledButton onClick={handleOnClick} variant="primary" style={{ marginBottom: "2em", padding: "14px 20px" }}>
        {isStarting && (
          <React.Fragment>
            <Spinner
              style={{ marginRight: "5px" }}
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            <span>Launching...</span>
          </React.Fragment>
        )}
        {!isStarting && <span>Launch Playground</span>}
      </StyledButton>

      <Alert variant="danger" style={{ width: "85%" }} show={error !== undefined} transition={false}>
        {error}
      </Alert>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  line-height: 3;
`