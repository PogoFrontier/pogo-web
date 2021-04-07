// Generate an array of IV combinations sorted by stat
import { cpms, shadowMult } from '@config/statVals'
import getCP from './getCP'

interface GetIVsProps {
  pokemon: any
  targetCP: number
  sortStat?: 'atk' | 'def' | 'overall'
  sortDirection?: number
  resultCount?: number
  ivFloor?: number
}

function getIVs({
  pokemon,
  targetCP,
  sortStat = 'overall',
  sortDirection = 1,
  resultCount = 1,
  ivFloor,
}: GetIVsProps) {
  const levelCap = 50
  let level = 0.5
  let atkIV = 15
  let defIV = 15
  let hpIV = 15
  let calcCP = 0
  let overall = 0
  let bestStat = 0
  let cpm = 0
  const combinations = []

  if (sortDirection === -1) {
    bestStat = Infinity
  }

  let floor = 0

  if (pokemon.tags && pokemon.tags.includes('legendary')) {
    floor = 1
  }

  if (ivFloor) {
    floor = ivFloor
  }

  if (pokemon.tags && pokemon.tags.includes('untradeable')) {
    floor = 10
  }

  hpIV = 15
  while (hpIV >= floor) {
    defIV = 15
    while (defIV >= floor) {
      atkIV = 15
      while (atkIV >= floor) {
        level = 0.5
        calcCP = 0

        while (level < levelCap && calcCP < targetCP) {
          level += 0.5
          cpm = cpms[(level - 1) * 2]
          calcCP = getCP(pokemon.baseStats, [level, atkIV, defIV, hpIV])
        }

        if (calcCP > targetCP) {
          level -= 0.5
          cpm = cpms[(level - 1) * 2]
          calcCP = getCP(pokemon.baseStats, [level, atkIV, defIV, hpIV])
        }

        if (calcCP <= targetCP) {
          const atk = cpm * (pokemon.baseStats.atk + atkIV)
          const def = cpm * (pokemon.baseStats.def + defIV)
          const hp = Math.floor(cpm * (pokemon.baseStats.hp + hpIV))
          overall = hp * atk * def

          const combination = {
            level,
            ivs: {
              atk: atkIV,
              def: defIV,
              hp: hpIV,
            },
            atk,
            def,
            hp,
            overall,
            cp: calcCP,
          }

          if (pokemon.tags && pokemon.tags.includes('shadow')) {
            combination.atk *= shadowMult[0]
            combination.def *= shadowMult[1]
          }

          let valid = true

          // This whole jumble won't include combinations that don't beat our best or worst if we just want one result
          if (resultCount === 1) {
            if (sortDirection === 1) {
              if (combination[sortStat] < bestStat) {
                valid = false
              }
            } else if (sortDirection === -1) {
              if (combination[sortStat] > bestStat) {
                valid = false
              }
            }
            if (valid) {
              bestStat = combination[sortStat]
            }
          }
          if (valid) {
            combinations.push(combination)
          }
        }
        atkIV--
      }
      defIV--
    }
    hpIV--
  }

  combinations.sort((a, b) =>
    a[sortStat] > b[sortStat]
      ? -1 * sortDirection
      : b[sortStat] > a[sortStat]
      ? 1 * sortDirection
      : 0
  )
  const results = combinations.splice(0, resultCount)

  return results
}

export default getIVs
