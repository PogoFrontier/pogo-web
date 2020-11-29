export interface TeamMember {
  speciesId: string
  species: string
  hp: number
  def: number
  atk: number
  cp: number
  types: [string, string]
  fastMove: string
  chargeMoves: [string, string] | [string]
  shiny?: boolean
  name?: string
}
