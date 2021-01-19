const getMini = (
  sid: number,
): string => {
  const w = sid.toString()
  return `https://firebasestorage.googleapis.com/v0/b/project-grookey.appspot.com/o/mini%2F${w}.png?alt=media&token=96e08512-fff8-4233-8478-bdfb894d7bec`
}

export default getMini
