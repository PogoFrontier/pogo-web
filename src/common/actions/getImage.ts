const getImage = (
  sid: number,
  shiny: boolean | undefined,
  back: boolean | undefined
): string => {
  let w = sid.toString()
  if (back) {
    w = w + '-b'
  }
  if (shiny) {
    w = w + '-s'
  }
  return `https://d1bbfbaqrr54l0.cloudfront.net/models/${w}.gif`
}

export default getImage
