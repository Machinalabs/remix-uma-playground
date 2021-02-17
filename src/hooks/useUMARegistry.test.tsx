import { renderHook } from "@testing-library/react-hooks"

import { useUMARegistry, UMARegistryProvider } from "./useUMARegistry"

describe("useUMARegistry tests", () => {
  const render = () => {
    const wrapper = ({ children }: any) => <UMARegistryProvider>{children}</UMARegistryProvider>
    const { result } = renderHook(() => useUMARegistry(), { wrapper })
    return {
      result,
    }
  }
  test("get AddressWhitelist", () => {
    const { result } = render()

    expect(result.current.getContractAddress("AddressWhitelist")).toBeDefined()
    expect(result.current.getContractAddress("AddressWhitelist")).toEqual("0xDFA95Ac05203120470a694e54cF983c4190642E7")
  })
})
