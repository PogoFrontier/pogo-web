const getMini = (sid: number): string => {
  let w = sid.toString()
  if (sid > 15776 && sid <= 15793) {
    w = '15776' // Special Arceus Case
  }
  if (sid > 20768 && sid <= 20772) {
    w = '20768' // Special Genesect Case
  }
  return `https://d1bbfbaqrr54l0.cloudfront.net/mini/${w}.png`
}

export default getMini
