import { SERVER } from "@config/index"

const getImage = (sid: number, shiny: boolean | undefined, back: boolean | undefined) : string => {
  let s = `${SERVER}/models/${sid.toString()}`
  if (back) {
    s = s + "-b"
  }
  if (shiny) {
    s = s + "-s"
  }
  return s + ".gif"
}

export default getImage