import {
  getPokemonData,
  getPokemonNames,
} from '@common/actions/pokemonAPIActions'
import calcCP from '@common/actions/getCP'
import getIVs from '@common/actions/getIVs'
import metaMap from '@common/actions/metaMap'
import parseName from '@common/actions/parseName'

/**
 * Maps the selected meta to a max CP value
 */
/**
 * returns a promise with a random Pokemon with random moves
 * @param meta the meta the pokemon has to be in
 */
async function getRandomPokemon(meta: string): Promise<any> {
  let randPokemon: string = 'Pidgey'
  let randCharged1: string = 'Twister'
  let randCharged2: string = 'Twister'
  let randFast: string = 'Tackle'

  // get a random pokemon
  await getPokemonNames().then((data) => {
    randPokemon = data[Math.round(Math.random() * data.length)]
  })

  // get random moves
  return getPokemonData(
    parseName(randPokemon),
    metaMap[meta].movesetOption
  ).then((data) => {
    const cap = metaMap[meta].maxCP
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

export default getRandomPokemon
