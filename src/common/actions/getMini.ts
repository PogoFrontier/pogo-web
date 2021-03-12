const getMini = (sid: number): string => {
  let w = sid.toString()
  if (sid > 15776 && sid <= 15793) {
    w = "15776" // Special Arceus Case
  }
  if (sid > 20768 && sid <= 20772) {
    w = "20768" // Special Genesect Case
  }
  return `https://firebasestorage.googleapis.com/v0/b/project-grookey.appspot.com/o/mini%2F${w}.png?alt=media&token=96e08512-fff8-4233-8478-bdfb894d7bec`
}

export default getMini
