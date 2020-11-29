export interface TeamMember {
  speciesId: string
  speciesName: string
  hp: number
  def: number
  atk: number
  cp: number
  types: [string, string]
  fastMove: string
  chargeMoves: [string, string] | [string]
  sid: number
  shiny?: boolean
  name?: string
}
