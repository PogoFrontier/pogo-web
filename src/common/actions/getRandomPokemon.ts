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
  price?: number
}

type getRandomPokemonParams = {
  meta: string
  rule: any // TODO: Make it Rule when movesets is added to advancedOptions
  position: number
  previousPokemon: TeamMemberWithDex[]
  className?: string
}

type moveWithRating = {
  moveId: string
  uses: number
}

type moveUsageData =
  | {
      fastMoves: moveWithRating[]
      chargedMoves: moveWithRating[]
    }
  | undefined

async function getRandomPokemon({
  meta,
  rule,
  position,
  previousPokemon,
  className,
}: getRandomPokemonParams): Promise<any> {
  if (meta === undefined) return undefined
  let randPokemon: string = 'Pidgey'
  let moveData: moveUsageData
  const usedPoints = previousPokemon
    .map((poke) => (poke.price ? poke.price : 0))
    .reduce((price1, price2) => price1 + price2, 0)

  // get a random pokemon
  await getPokemonNames(meta, position, false, usedPoints, className).then(
    (data) => {
      randPokemon = getRandomPokemonSpecies(data, (speciesPool: string[]) => {
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
        return speciesPool
      })

      moveData = data[randPokemon].moves
    }
  )

  // get random moves
  const moveset =
    rule.advancedOptions === undefined
      ? 'original'
      : rule.advancedOptions.movesets === undefined
      ? 'original'
      : rule.advancedOptions.movesets
  return getPokemonData(
    parseName(randPokemon),
    moveset,
    meta,
    undefined,
    className
  ).then((data) => {
    const cap = rule.maxCP
    const pokemon = data
    const stats = getIVs({
      pokemon,
      targetCP: cap ? cap : 10000,
    })[0]

    const isShadow = data.tags && data.tags.includes('shadow')
    const chargedMovePool = data.chargedMoves
    if (data.tags && data.tags.includes('shadoweligible')) {
      chargedMovePool.push('RETURN')
    } else if (isShadow) {
      chargedMovePool.push('FRUSTRATION')
    }
    const { fastMove, chargedMoves } = getRandomMoves(
      moveData,
      data.fastMoves,
      chargedMovePool
    )

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
      price: data.price,
      types: data.types,
      fastMove,
      chargeMoves: chargedMoves,
      sid: data.sid,
      dex: data.dex,
    }
  })
}

function getRandomPokemonSpecies(
  data: any,
  filter: (speciesPool: string[]) => string[]
): string {
  let speciesPool = Object.keys(data)
  speciesPool = filter(speciesPool)

  const ratingSum: number = speciesPool
    .map((speciesId) => (data[speciesId].ranking ? data[speciesId].ranking : 0))
    .map((rating) => Math.pow(rating / 1000, 6))
    .reduce((r1, r2) => r1 + r2)

  if (ratingSum !== 0) {
    let rand = Math.round(Math.random() * ratingSum)
    const randPokemon = speciesPool.find((speciesId) => {
      let rating: number = data[speciesId].ranking ? data[speciesId].ranking : 0
      rating = Math.pow(rating / 1000, 6)
      rand -= rating
      return rand <= 0
    })
    if (randPokemon) {
      return randPokemon
    }
  }

  return speciesPool[Math.floor(Math.random() * speciesPool.length)]
}

function getRandomMoves(
  moveData: moveUsageData,
  fastMoves: string[],
  chargedMovePool: string[]
): {
  fastMove: string
  chargedMoves: [string, string]
} {
  let randFast: string

  if (moveData) {
    let usageSum: number
    let rand: number
    // get chargedmoves
    const chargedMoves: [string, string] = ['NONE', 'NONE']
    for (const i of [0, 1]) {
      usageSum = moveData.chargedMoves
        .map((chargedMove) => (chargedMove.uses ? chargedMove.uses : 1))
        .reduce((use1, use2) => use1 + use2)
      rand = Math.random() * usageSum
      const randChargedMove = moveData.chargedMoves.find((chargedMove) => {
        rand -= chargedMove.uses ? chargedMove.uses : 1
        return rand <= 0
      })
      if (randChargedMove) {
        chargedMoves[i] = randChargedMove.moveId
      }
      moveData.chargedMoves = moveData.chargedMoves.filter(
        (chargedMove) => chargedMove !== randChargedMove
      )
      if (moveData.chargedMoves.length === 0) {
        break
      }
    }

    // get fastmove
    usageSum = moveData.fastMoves
      .map((fastMove) => (fastMove.uses ? fastMove.uses : 1))
      .reduce((use1, use2) => use1 + use2)
    rand = Math.random() * usageSum
    randFast = moveData.fastMoves.find((fastMove) => {
      rand -= fastMove.uses ? fastMove.uses : 1
      return rand <= 0
    })!.moveId

    return {
      fastMove: randFast,
      chargedMoves,
    }
  }

  // Get moves with equal odds for all moves
  const randCharged1 =
    chargedMovePool[Math.floor(Math.random() * chargedMovePool.length)]
  chargedMovePool.splice(chargedMovePool.indexOf(randCharged1), 1)
  let randCharged2: string
  chargedMovePool.length === 0
    ? (randCharged2 = 'NONE')
    : (randCharged2 =
        chargedMovePool[Math.floor(Math.random() * chargedMovePool.length)])
  randFast = fastMoves[Math.floor(Math.random() * fastMoves.length)]

  return {
    chargedMoves: [randCharged1, randCharged2],
    fastMove: randFast,
  }
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
