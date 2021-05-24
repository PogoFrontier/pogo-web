import { cpms } from '@config/statVals'
export interface BaseStatsProps {
  atk: number
  def: number
  hp: number
}
const getCP = (bs: BaseStatsProps, stats: number[]): number => {
  const cpm = cpms[(stats[0] - 1) * 2]
  const atk = stats[1]
  const def = stats[2]
  const hp = stats[3]
  const cp =
    (bs.atk + atk) *
    Math.sqrt(bs.def + def) *
    Math.sqrt(bs.hp + hp) *
    cpm *
    cpm *
    0.1
  return Math.floor(cp)
}

export default getCP
