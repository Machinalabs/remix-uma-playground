import { ThemeType } from "../types"

const darkTheme = {
  fontColor: "white",
  modalFontColor: "white",
}

const lightTheme = {
  fontColor: "black",
  modalFontColor: "white",
}

export const getTheme = (themeType: ThemeType) => {
  if (themeType === "dark") {
    return darkTheme
  }
  return lightTheme
}
