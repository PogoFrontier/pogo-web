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
  return `https://firebasestorage.googleapis.com/v0/b/project-grookey.appspot.com/o/models%2F${w}.gif?alt=media&token=a9c44e0f-fe8e-4171-850f-607c8487ae1e`
}

export default getImage
