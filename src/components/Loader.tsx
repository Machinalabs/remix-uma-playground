import React from "react"
import { Spinner } from "react-bootstrap"
import Box from "@material-ui/core/Box"

export const Loader: React.FC = () => {
  return (
    <Box py={2} textAlign="center">
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
    </Box>
  )
}
