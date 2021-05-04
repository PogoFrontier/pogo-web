import { cpms, shadowMult } from "@config/statVals"

const calculateStats = (
  bs: {
    atk: number
    def: number
    hp: number
  },
  level: number,
  atk: number,
  def: number,
  hp: number,
  shadow?: boolean
) => {
  const cpm = cpms[(level - 1) * 2]
  const selectedHP = Math.floor((bs.hp + hp) * cpm)
  let selectedAtk = (bs.atk + atk) * cpm
  let selectedDef = (bs.def + def) * cpm
  if (shadow) {
    selectedAtk *= shadowMult[0]
    selectedDef *= shadowMult[1]
  }
  return {
    hp: selectedHP,
    atk: selectedAtk,
    def: selectedDef,
  }
}

export default calculateStats