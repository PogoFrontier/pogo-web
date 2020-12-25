export const colors = [
  '#65E5C2',
  '#5EDB89',
  '#FDA50F',
  '#FF3100'
]

const getColor = (ratio: number): string => {
  if (ratio === 1) {
    return colors[0]
  } else if (ratio > 0.5) {
    return colors[1]
  } else if (ratio > 0.25) {
    return colors[2]
  } else {
    return colors[3]
  }
}

export default getColor