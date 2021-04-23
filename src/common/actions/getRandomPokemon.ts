import {
  getPokemonData,
  getPokemonNames,
} from '@common/actions/pokemonAPIActions'
import calcCP from '@common/actions/getCP'
import getIVs from '@common/actions/getIVs'
import parseName from '@common/actions/parseName'
// import { Rule} from '@adibkhan/pogo-web-backend'

/**
 * returns a promise with a random Pokemon with random moves
 * @param meta the meta the pokemon has to be in. Formatted as a Rule type.
 */

// TODO: change type of meta to any, however typescript errors when doing that
async function getRandomPokemon(meta: any): Promise<any> {
  if (meta === undefined) return undefined
  let randPokemon: string = 'Pidgey'
  let randCharged1: string = 'Twister'
  let randCharged2: string = 'Twister'
  let randFast: string = 'Tackle'

  // get a random pokemon
  await getPokemonNames().then((data) => {
    let changedData = data

    // checkers for include, and exclude pokemon
    if (meta.include !== undefined) {
      meta.include.forEach((e: any) => {
        switch (e.filterType) {
          case 'tag':
            /*
            changedData = changedData.filter((p: any) => {
              e.values.forEach((value: string) => {
                if(p.includes(value)) return true
              });
              return false
            })
            */
            break
          case 'id':
            changedData = changedData.filter((p: any) => {
              e.values.forEach((value: string) => {
                if (value === p) return true
              })
              return false
            })
            break
          case 'dex':
            changedData = changedData.filter((p: any) => {
              e.values.forEach((value: number) => {
                if (changedData.indexOf(p) === value) return true
              })
              return false
            })
            break
          default:
            break
        }
      })
    }

    if (meta.exlude !== undefined) {
      meta.exclude.forEach((e: any) => {
        switch (e.filterType) {
          case 'tag':
            /*
            changedData = changedData.filter((p: any) => {
              e.values.forEach((value: string) => {
                if(p.includes(value)) return false
              });
              return true
            })
            */
            break
          case 'id':
            changedData = changedData.filter((p: any) => {
              e.values.forEach((value: string) => {
                if (value === p) return false
              })
              return true
            })
            break
          case 'dex':
            changedData = changedData.filter((p: any) => {
              e.values.forEach((value: number) => {
                if (changedData.indexOf(p) === value) return false
              })
              return true
            })
            break
          default:
            break
        }
      })
    }

    randPokemon = changedData[Math.round(Math.random() * changedData.length)]
  })

  // get random moves
  const moveset =
    meta.advancedOptions === undefined
      ? 'original'
      : meta.advancedOptions.movesets === undefined
      ? 'original'
      : meta.advancedOptions.movesets
  return getPokemonData(parseName(randPokemon), moveset).then((data) => {
    const cap = meta.maxCP
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
