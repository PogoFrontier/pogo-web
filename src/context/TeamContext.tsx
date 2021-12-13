import { createContext } from 'react'
import { UserTeam } from '@context/UserContext'

export const defaultTeam: UserTeam = {
  name: 'Default',
  id: 'defaultTeam',
  format: 'Great League_UNRANKED',
  members: [
    {
      speciesId: 'dragonite',
      speciesName: 'Dragonite',
      hp: 113,
      def: 108.35,
      atk: 135.31,
      cp: 1500,
      iv: {
        atk: 3,
        def: 15,
        hp: 14,
      },
      level: 14.5,
      types: ['dragon', 'flying'],
      fastMove: 'DRAGON_BREATH',
      chargeMoves: ['DRAGON_CLAW', 'HURRICANE'],
      sid: 4768,
      name: 'Henry',
      shiny: true,
      gender: "F"
    },
    {
      speciesId: 'blastoise',
      speciesName: 'Blastoise',
      hp: 130,
      def: 142.22,
      atk: 110.19,
      cp: 1498,
      iv: {
        atk: 1,
        def: 15,
        hp: 15,
      },
      level: 23,
      types: ['water', 'none'],
      fastMove: 'WATER_GUN',
      chargeMoves: ['HYDRO_CANNON', 'ICE_BEAM'],
      sid: 288,
      gender: "M"
    },
    {
      speciesId: 'charizard',
      speciesName: 'Charizard',
      hp: 117,
      def: 110.9,
      atk: 131.55,
      cp: 1500,
      iv: {
        atk: 0,
        def: 15,
        hp: 13,
      },
      level: 19.5,
      types: ['fire', 'flying'],
      fastMove: 'FIRE_SPIN',
      chargeMoves: ['DRAGON_CLAW', 'BLAST_BURN'],
      sid: 192,
      gender: "M"
    },
    {
      speciesId: 'venusaur',
      speciesName: 'Venusaur',
      hp: 123,
      def: 124.27,
      atk: 121.21,
      cp: 1498,
      iv: {
        atk: 0,
        def: 14,
        hp: 11,
      },
      level: 21,
      types: ['grass', 'poison'],
      fastMove: 'VINE_WHIP',
      chargeMoves: ['FRENZY_PLANT', 'SLUDGE_BOMB'],
      sid: 96,
      gender: "F"
    },
    {
      speciesId: 'mew',
      speciesName: 'Mew',
      hp: 129,
      def: 122.09,
      atk: 119.38,
      cp: 1499,
      iv: {
        atk: 10,
        def: 15,
        hp: 13,
      },
      level: 16.5,
      types: ['psychic', 'none'],
      fastMove: 'SHADOW_CLAW',
      chargeMoves: ['SURF', 'WILD_CHARGE'],
      sid: 4832,
      gender: "N"
    },
    {
      speciesId: 'mewtwo_shadow',
      speciesName: 'Mewtwo (Shadow)',
      hp: 108,
      def: 77.4,
      atk: 179.1,
      cp: 1498,
      iv: {
        atk: 4,
        def: 15,
        hp: 15,
      },
      level: 13,
      types: ['psychic', 'none'],
      fastMove: 'PSYCHO_CUT',
      chargeMoves: ['FLAMETHROWER', 'PSYSTRIKE'],
      sid: 4800,
      gender: "N"
    },
  ],
}

const TeamContext = createContext({} as {
  team: UserTeam,
  setTeam: (team: UserTeam) => void
})

export default TeamContext
