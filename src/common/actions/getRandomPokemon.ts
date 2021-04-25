import {
  getPokemonData,
  getPokemonNames,
} from '@common/actions/pokemonAPIActions'
import calcCP from '@common/actions/getCP'
import getIVs from '@common/actions/getIVs'
import parseName from '@common/actions/parseName'
import { TeamMember } from '@adibkhan/pogo-web-backend/team'
// import { Rule } from '@adibkhan/pogo-web-backend'

/**
 * returns a promise with a random Pokemon with random moves
 * @param meta the meta the pokemon has to be in. Formatted as a Rule type.
 */

type TeamMemberWithDex = TeamMember & {
  dex: number
}

type getRandomPokemonParams = {
  meta: string
  rule: any // TODO: Make it Rule when movesets is added to advancedOptions
  position: number
  previousPokemon: TeamMemberWithDex[]
}

async function getRandomPokemon({
  meta,
  rule,
  position,
  previousPokemon,
}: getRandomPokemonParams): Promise<any> {
  if (meta === undefined) return undefined
  let randPokemon: string = 'Pidgey'
  let randCharged1: string = 'Twister'
  let randCharged2: string = 'Twister'
  let randFast: string = 'Tackle'

  // get a random pokemon
  await getPokemonNames(meta, position, true).then((data) => {
    let speciesPool = Object.keys(data)

    if (rule.flags && rule.flags.speciesClauseByForm) {
      speciesPool = speciesPool.filter(
        (speciesId) =>
          !previousPokemon
            .map((pokemon) => pokemon.speciesId)
            .includes(speciesId)
      )
    }
    if (rule.flags && rule.flags.speciesClauseByDex) {
      speciesPool = speciesPool.filter(
        (speciesId) =>
          !previousPokemon
            .map((pokemon) => pokemon.dex)
            .includes(data[speciesId].dex)
      )
    }
    if (rule.flags && rule.flags.typeClause) {
      speciesPool = speciesPool.filter(
        (speciesId) =>
          !previousPokemon
            .map((pokemon) => pokemon.types)
            .some((poke1Types) =>
              isThereADuplicateType(poke1Types, data[speciesId].types)
            )
      )
    }

    randPokemon = speciesPool[Math.round(Math.random() * speciesPool.length)]
  })

  // get random moves
  const moveset =
    rule.advancedOptions === undefined
      ? 'original'
      : rule.advancedOptions.movesets === undefined
      ? 'original'
      : rule.advancedOptions.movesets
  return getPokemonData(parseName(randPokemon), moveset).then((data) => {
    const cap = rule.maxCP
    const isShadow = data.tags && data.tags.includes('shadow')

    const chargedMoves = data.chargedMoves
    if (data.tags && data.tags.includes('shadoweligible')) {
      chargedMoves.push('RETURN')
    } else if (isShadow) {
      chargedMoves.push('FRUSTRATION')
    }
    randCharged1 = chargedMoves[Math.floor(Math.random() * chargedMoves.length)]
    chargedMoves.splice(chargedMoves.indexOf(randCharged1), 1)
    chargedMoves.length === 0
      ? (randCharged2 = 'NONE')
      : (randCharged2 =
          chargedMoves[Math.floor(Math.random() * chargedMoves.length)])
    randFast = data.fastMoves[Math.floor(Math.random() * data.fastMoves.length)]
    const pokemon = data
    const stats = getIVs({
      pokemon,
      targetCP: cap ? cap : 10000,
    })[0]

    return {
      speciesId: data.speciesId,
      speciesName: data.speciesName,
      baseStats: data.baseStats,
      hp: stats.hp,
      atk: stats.atk,
      def: stats.def,
      level: stats.level,
      iv: {
        atk: stats.ivs.atk,
        def: stats.ivs.def,
        hp: stats.ivs.hp,
      },
      cp: calcCP(data.baseStats, [
        stats.level,
        stats.ivs.atk,
        stats.ivs.def,
        stats.ivs.hp,
      ]),
      types: data.types,
      fastMove: randFast,
      chargeMoves: [randCharged1, randCharged2],
      sid: data.sid,
      dex: data.dex,
    }
  })
}

function isThereADuplicateType(
  poke1Types: string[],
  poke2Types: string[]
): boolean {
  return poke1Types.some((type1) =>
    poke2Types.some((type2) => type1 === type2 && type1 !== 'none')
  )
}

export default getRandomPokemon
