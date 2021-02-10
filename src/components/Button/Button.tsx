import React from "react"
import BootstrapButton, { ButtonProps } from "react-bootstrap/Button"
import Spinner from "react-bootstrap/Spinner"
import styled from "styled-components"

export const StyledButton = styled(BootstrapButton)`
  padding-left: 1.5em;
  padding-right: 1.5em;
  padding-top: 6px;
  padding-bottom: 6px;
`

interface Props extends ButtonProps {
  isloading: boolean
  loadingText: string
  text: string
  show?: boolean
}

export const Button: React.FC<Props> = ({ isloading, loadingText, text, show = true, ...props }) => {
  return show ? (
    <StyledButton {...props}>
      {isloading ? (
        <React.Fragment>
          <Spinner
            style={{ marginRight: "5px" }}
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
          <span>{loadingText}</span>
        </React.Fragment>
      ) : <span>{text}</span>}
    </StyledButton>
  ) : (
      <React.Fragment />
    )
}
