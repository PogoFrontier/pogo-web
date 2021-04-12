import getCP from './getCP'

interface StatSet {
  atk: number
  def: number
  hp: number
}

function getMaxLevel(
  baseStats: StatSet,
  iv: StatSet,
  targetCP: number,
  levelCap: number
): number {
  let level = 0.5
  let calcCP = 0

  while (level <= levelCap && calcCP <= targetCP) {
    level += 0.5
    calcCP = getCP(baseStats, [level, iv.atk, iv.def, iv.hp])
  }

  if (calcCP > targetCP) {
    level -= 0.5
  }

  return level
}

export default getMaxLevel
