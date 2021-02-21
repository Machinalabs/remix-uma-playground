const http = require("http") // tslint:disable-line
const Web3HttpProvider = require("web3-providers-http") // tslint:disable-line

export const getInjectedProvider = (url: string) => {
  const options = {
    keepAlive: true,
    timeout: 2000, // milliseconds,
    withCredentials: false,
    headers: [{ name: "Access-Control-Allow-Origin", value: "*" }],
    agent: { http: http.Agent(), baseUrl: "" },
  }

  const injectedProvider = new Web3HttpProvider(url, options)

  return injectedProvider
}
