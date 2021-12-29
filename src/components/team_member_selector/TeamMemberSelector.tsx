import React, { useContext, useEffect, useState } from 'react'
import {
  getPokemonData,
  getPokemonNames,
} from '@common/actions/pokemonAPIActions'
import { ivValues, levelValues } from '@config/statVals'
import ImageHandler from '@common/actions/getImages'
import style from './style.module.scss'
import Input from '@components/input/Input'
import classNames from 'classnames'
import { TeamMember } from '@adibkhan/pogo-web-backend'
import TypeIcons from '@components/type_icon/TypeIcons'
import calcCP from '@common/actions/getCP'
import getIVs from '@common/actions/getIVs'
import getMaxLevel from '@common/actions/getMaxLevel'
import metaMap from '@common/actions/metaMap'
import parseName from '@common/actions/parseName'
import calculateStats from '@common/actions/calculateStats'
import SettingsContext from '@context/SettingsContext'
import LanguageContext from '@context/LanguageContext'
import mapLanguage from '@common/actions/mapLanguage'
import TriangleTooltip from '@components/tooltip/TriangleTooltip'
import { useMoves } from '../contexts/PokemonMovesContext'

// TODO: find better type definition for speciesName
type pokemonType = {
  speciesName: any
  speciesId: string
  types: string[]
  tags?: string[]
  dex: number
  moves: {
    fastMoves: { moveId: string }[]
    chargedMoves: { moveId: string }[]
  }
}

const TeamMemberSelector = (props: {
  cancelEdit: () => void
  savePokemon: (pokemon: any) => void
  member: TeamMember
  deletePokemon: () => void
  meta: string
  position: number
  metaClassName?: string
  classSelector: () => React.ReactElement | null
}) => {
  const {
    cancelEdit,
    savePokemon,
    member,
    deletePokemon,
    meta,
    position,
    metaClassName,
    classSelector,
  } = props
  const [userInput, setUserInput] = useState('')
  const [suggestions, setSuggestions] = useState<Map<string, pokemonType>>(
    new Map()
  )
  const [activeSuggestion, setActiveSuggestion] = useState(0)
  const [filteredSuggestions, setFilteredSuggestions] = useState([] as any)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedPokemonData, setSelectedPokemonData] = useState<any | null>(
    null
  )
  const [addToBox, setAddToBox] = useState<any | null>(null)
  const [shouldSave, setShouldSave] = useState<boolean>(false)
  const [pokemonNames, setPokemonNames] = useState<any | null>(null)

  const imageHandler = new ImageHandler()
  const settings = useContext(SettingsContext)
  const { strings, current } = useContext(LanguageContext)

  useEffect(() => {
    if (member && member.speciesName) {
      setAddToBox(member)
      getPokemonData(member.speciesId, metaMap[meta].movesetOption).then(
        (pokemon) => {
          if (pokemon && pokemon.chargedMoves) {
            pokemon.chargedMoves.push('NONE')
            if (
              metaMap[meta].movesetOption === 'original' &&
              pokemon.tags &&
              pokemon.tags.includes('shadoweligible')
            ) {
              pokemon.chargedMoves.push('RETURN')
            } else if (
              metaMap[meta].movesetOption === 'original' &&
              pokemon.tags &&
              pokemon.tags.includes('shadow')
            ) {
              pokemon.chargedMoves.push('FRUSTRATION')
            }
            setSelectedPokemonData(pokemon)
          }
        }
      )
    } else if (addToBox && addToBox.speciesName) {
      setAddToBox(null)
    }
  }, [member])

  useEffect(() => {
    getPokemonNames(meta, position, false, 0, metaClassName).then((data) => {
      setPokemonNames(data)
      const pokemonData = new Map()
      Object.keys(data).forEach((speciesId) =>
        pokemonData.set(speciesId, data[speciesId])
      )
      setSuggestions(pokemonData)
    })
  }, [position, meta, metaClassName])

  const onChange = (e: any) => {
    const input: string = e.currentTarget.value.toLowerCase()
    let tagNeedle = input
    if (tagNeedle === '@frustration') {
      tagNeedle = 'shadow'
    } else if (tagNeedle === '@return') {
      tagNeedle = 'shadoweligible'
    }
    const dexRange = [
      [1, 151],
      [152, 251],
      [252, 386],
      [387, 493],
      [494, 649],
      [650, 721],
      [722, 809],
      [810, 898],
    ][
      ['kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'alola', 'galar'].indexOf(
        input
      )
    ]

    setUserInput(input)
    setFilteredSuggestions(
      Array.from(suggestions.values())
        .filter((suggestion) => {
          // In case a pokemon isn't translated yet, don't include it
          if (
            !suggestion ||
            !suggestion.speciesName ||
            !suggestion.speciesName[mapLanguage(settings.language)]
          ) {
            return false
          }

          // Is all string?
          if (input === 'all' || input === '@all') {
            return true
          }

          // Is substring of speciesId?
          if (
            suggestion.speciesName[mapLanguage(settings.language)]
              .toLowerCase()
              .indexOf(input) > -1
          ) {
            return true
          }

          // Is the pokémon's type
          if (suggestion.types.includes(input)) {
            return true
          }

          // Is the pokémon's tag
          if (suggestion.tags?.includes(tagNeedle)) {
            return true
          }

          // Is the pokémon's move
          const moves = suggestion.moves.fastMoves.concat(
            ...suggestion.moves.chargedMoves
          )
          if (
            input.startsWith('@') &&
            moves?.some((fastMove) =>
              fastMove.moveId.includes(
                input.toUpperCase().slice(1).replace(' ', '_')
              )
            )
          ) {
            return true
          }

          // Is in dex-range
          if (
            dexRange &&
            suggestion?.dex &&
            suggestion.dex >= dexRange[0] &&
            suggestion.dex <= dexRange[1]
          ) {
            return true
          }

          return false
        })
        .map(
          (suggestion) => suggestion.speciesName[mapLanguage(settings.language)]
        )
        .sort((s1, s2) => {
          const s1Val = s1.toLowerCase().startsWith(input) ? 1 : 0
          const s2Val = s2.toLowerCase().startsWith(input) ? 1 : 0
          return s2Val - s1Val
        })
    )
    setShowSuggestions(true)
  }

  const onKeyDown = (e: any) => {
    switch (e.keyCode) {
      case 13: // enter
        setPokemon(filteredSuggestions[activeSuggestion])
        break
      case 38: // up arrow
        if (activeSuggestion !== 0) setActiveSuggestion(activeSuggestion - 1)
        break
      case 40: // down arrow
        if (activeSuggestion - 1 !== filteredSuggestions.length) {
          setActiveSuggestion(activeSuggestion + 1)
        }
        break
      default:
        break
    }
  }
  const getSpeciesId = (name: string) => {
    for (const _p of Object.keys(pokemonNames)) {
      for (const lang of Object.keys(pokemonNames[_p].speciesName)) {
        if (pokemonNames[_p].speciesName[lang] === undefined) {
          return parseName(pokemonNames[name].speciesName.en)
        }
        if (pokemonNames[_p].speciesName[lang] === name) {
          return parseName(pokemonNames[_p].speciesName.en)
        }
      }
    }
    return 'bulbasaur'
  }
  const setPokemon = (input: string) => {
    setUserInput(input)
    getPokemonData(
      getSpeciesId(input),
      metaMap[meta].movesetOption,
      meta,
      position,
      metaClassName
    )
      .then((pokemon) => {
        if (pokemon) {
          const isShadow = pokemon.tags && pokemon.tags.includes('shadow')
          pokemon.chargedMoves.push('NONE')
          if (
            metaMap[meta].movesetOption === 'original' &&
            pokemon.tags &&
            pokemon.tags.includes('shadoweligible')
          ) {
            pokemon.chargedMoves.push('RETURN')
          } else if (metaMap[meta].movesetOption === 'original' && isShadow) {
            pokemon.chargedMoves.push('FRUSTRATION')
          }
          setActiveSuggestion(0)
          setFilteredSuggestions([])
          setShowSuggestions(false)
          setSelectedPokemonData(pokemon)
          const cap = metaMap[meta].maxCP
          const stats = getIVs({
            pokemon,
            targetCP: cap ? cap : 10000,
          })[0]
          const fastMove = pokemon.moveset
            ? pokemon.moveset[0]
            : pokemon.fastMoves[0]
          const chargeMoves = pokemon.moveset
            ? pokemon.moveset.slice(1)
            : pokemon.chargedMoves.splice(0, 2)
          const gender = pokemon.gender
            ? pokemon.gender
            : ['M', 'F'][Math.round(Math.random())]
          setAddToBox({
            speciesId: pokemon.speciesId,
            speciesName: pokemon.speciesName[mapLanguage(settings.language)],
            baseStats: pokemon.baseStats,
            hp: stats.hp,
            atk: stats.atk,
            def: stats.def,
            level: stats.level,
            iv: {
              atk: stats.ivs.atk,
              def: stats.ivs.def,
              hp: stats.ivs.hp,
            },
            cp: stats.cp,
            types: pokemon.types,
            fastMove,
            chargeMoves,
            sid: pokemon.sid,
            gender,
          })
          setShouldSave(true)
        }
      })
      .catch(() => {
        setUserInput('')
        setActiveSuggestion(0)
        setFilteredSuggestions([])
        setShowSuggestions(false)
        // show error message that pokemon not found
      })
  }

  const clearPokemonName = () => {
    handleNicknameChange('')
  }

  const handlePokemonChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!addToBox.baseStats) {
      alert(strings.corrupted_data_warning)
      return deletePokemon()
    }
    if (['level', 'atk', 'def', 'hp'].includes(e.target.id)) {
      const statsObj: any = {
        level: addToBox.level,
        atk: addToBox.iv.atk,
        def: addToBox.iv.def,
        hp: addToBox.iv.hp,
      }
      statsObj[e.target.id] = +e.target.value

      if (e.target.id !== 'level') {
        addToBox.level = getMaxLevel(
          addToBox.baseStats,
          statsObj,
          metaMap[meta].maxCP,
          50
        )
        statsObj.level = addToBox.level
      }

      const newCP = calcCP(selectedPokemonData.baseStats, [
        statsObj.level,
        statsObj.atk,
        statsObj.def,
        statsObj.hp,
      ])
      const stats = calculateStats(
        addToBox.baseStats,
        statsObj.level,
        statsObj.atk,
        statsObj.def,
        statsObj.hp
      )
      // later, check newCP against the CP cap of the meta
      if (e.target.id === 'level') {
        setAddToBox((prevState: any) => ({
          ...prevState,
          hp: stats.hp,
          atk: stats.atk,
          def: stats.def,
          level: +e.target.value,
          cp: newCP,
        }))
      } else {
        const newIVs = { ...addToBox.iv }
        newIVs[e.target.id] = +e.target.value
        setAddToBox((prevState: any) => ({
          ...prevState,
          hp: stats.hp,
          atk: stats.atk,
          def: stats.def,
          iv: newIVs,
          cp: newCP,
        }))
      }
    } else if (e.target.id.startsWith('chargeMove')) {
      const index = +e.target.id.charAt(e.target.id.length - 1) - 1
      const cmArr = [...addToBox.chargeMoves]
      const otherIndex = index === 0 ? 1 : 0
      if (addToBox.chargeMoves[otherIndex] === e.target.value) {
        cmArr[otherIndex] = addToBox.chargeMoves[index]
      }
      cmArr[index] = e.target.value
      setAddToBox((prevState: any) => ({
        ...prevState,
        chargeMoves: cmArr,
      }))
    } else if (e.target.id === 'shiny') {
      const target = e.target as HTMLInputElement
      setAddToBox((prevState: any) => ({
        ...prevState,
        [e.target.id]: target.checked,
      }))
    } else if (e.target.id === 'gender') {
      const target = e.target as HTMLInputElement
      setAddToBox((prevState: any) => ({
        ...prevState,
        [e.target.id]: target.value.slice(0, 1),
      }))
    } else if (e.target.id.startsWith('name')) {
      handleNicknameChange(e.target.value)
    } else {
      setAddToBox((prevState: any) => ({
        ...prevState,
        [e.target.id]: e.target.value,
      }))
    }

    setShouldSave(true)
  }

  const handleNicknameChange = (value: string) => {
    const deepCopy = { ...addToBox }
    if (value === '') {
      if (deepCopy.name) delete deepCopy.name
      setAddToBox(deepCopy)
    } else {
      deepCopy.name = value
      setAddToBox(deepCopy)
    }

    setShouldSave(true)
  }

  const toTitleCase = (text: string) => {
    return text
      .toLowerCase()
      .split('_')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ')
  }

  const cancel = () => {
    setUserInput('')
    setSelectedPokemonData(null)
    setAddToBox(null)
    cancelEdit()
  }

  const handleSetPokemon = (e: any) => {
    setPokemon(e.currentTarget.innerText)
    setUserInput('')
  }

  const handleDelete = () => {
    deletePokemon()
  }

  if (shouldSave) {
    savePokemon(addToBox)
    setShouldSave(false)
  }

  const getSpeciesName = (pokemon: pokemonType | TeamMember) => {
    if (!pokemon) {
      return ''
    }
    if (!pokemonNames || !pokemonNames[pokemon.speciesId]) {
      return pokemon.speciesName
    }
    const lang = mapLanguage(settings.language)
    return (
      pokemonNames[pokemon.speciesId].speciesName[lang] ??
      pokemonNames[pokemon.speciesId].speciesName.en
    )
  }

  const [movesMap] = useMoves() || []

  return (
    <div className={style.container}>
      {selectedPokemonData && addToBox ? (
        <div className={style.info}>
          <div className={style.memberinfo}>
            <span className={style.btnRow}>
              {!member ? (
                <button className={style.exit} onClick={cancel}>
                  {strings.exit}
                </button>
              ) : (
                <button className={style.exit} onClick={handleDelete}>
                  {strings.delete}
                </button>
              )}
            </span>
            <label className={style.cp}>{getSpeciesName(addToBox)}</label>
            <br />
            <label className={style.cp}>
              {strings.cp} <b>{addToBox.cp}</b>
            </label>
            <br />
            <TypeIcons types={addToBox.types} />
            <br />
            <div className={style.imagecontainer}>
              <img
                src={imageHandler.getImage(
                  addToBox.sid,
                  addToBox.shiny,
                  addToBox.gender,
                  false
                )}
                key={imageHandler.getImage(
                  addToBox.sid,
                  addToBox.shiny,
                  addToBox.gender,
                  false
                )}
                alt={addToBox.speciesName}
                className="sprite"
              />
            </div>
          </div>
          <br />
          <div className={style.label}>
            <label className="shiny-label">
              {strings.shiny_question}{' '}
              <input
                type="checkbox"
                name="shiny"
                id="shiny"
                checked={addToBox.shiny ? addToBox.shiny : false}
                onChange={handlePokemonChange}
              />
            </label>
            <br />
          </div>
          {!!selectedPokemonData.gender || (
            <div className={`${style.gender} ${style.label}`}>
              <label className="gender-label">{strings.gender_question} </label>
              <select
                className="gender-select"
                name="gender-select"
                id="gender"
                onChange={handlePokemonChange}
                value={
                  { M: strings.gender_male, F: strings.gender_female }[
                    addToBox.gender
                  ]
                }
              >
                {[strings.gender_male, strings.gender_female].map(
                  (gender: string) => (
                    <option value={gender} key={gender}>
                      {gender}
                    </option>
                  )
                )}
              </select>
            </div>
          )}
          <div className={style.label}>
            <div className={style.nickname}>
              <label className="name-label">{strings.nickname} </label>
              <input
                type="text"
                placeholder="None"
                id="name"
                onChange={handlePokemonChange}
                value={addToBox.name ? addToBox.name : ''}
              />
              <button
                className="clear-name-btn"
                id="name-clear-btn"
                onClick={clearPokemonName}
              >
                {strings.clear}
              </button>
            </div>
          </div>

          <div className={`${style.fastmove} ${style.label}`}>
            <label className="fast-move-label">{strings.fast_move} </label>
            <select
              className="fast-moves-select"
              name="fast-moves-select"
              id="fastMove"
              onChange={handlePokemonChange}
              value={addToBox.fastMove}
            >
              {selectedPokemonData.fastMoves.map((move: string) => (
                <option value={move} key={move}>
                  {movesMap?.[move]?.name?.[current]
                    ? movesMap[move].name[current]
                    : toTitleCase(move)}
                </option>
              ))}
            </select>
          </div>
          <div className={`${style.label} ${style.chargedMoves}`}>
            <div>
              <label className="charge-move-label">
                {strings.charge_moves}{' '}
              </label>
            </div>
            <div className={style.chargeMovesSelect}>
              <select
                className="charge-move-1"
                name="charge-move-1"
                id="chargeMove1"
                onChange={handlePokemonChange}
                value={addToBox.chargeMoves[0]}
              >
                {selectedPokemonData.chargedMoves.map((move: string) => (
                  <option value={move} key={move}>
                    {movesMap?.[move]?.name?.[current]
                      ? movesMap[move].name[current]
                      : toTitleCase(move)}
                  </option>
                ))}
              </select>
              <select
                className="charge-move-2"
                name="charge-move-2"
                id="chargeMove2"
                onChange={handlePokemonChange}
                value={addToBox.chargeMoves[1]}
              >
                {selectedPokemonData.chargedMoves.map((move: string) => (
                  <option value={move} key={move}>
                    {movesMap?.[move]?.name?.[current]
                      ? movesMap[move].name[current]
                      : toTitleCase(move)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <TriangleTooltip
            label={`ATK: ${addToBox.atk.toFixed(2)},
            DEF: ${addToBox.def.toFixed(2)},
            HP: ${addToBox.hp}
            `}
          >
            <div className="stats">
              <div className={`level ${style.label}`}>
                <label className="level-label"> {strings.level} </label>
                <select
                  className="level-select"
                  name="level-select"
                  id="level"
                  onChange={handlePokemonChange}
                  value={addToBox.level}
                >
                  {levelValues.map((val: number) => (
                    <option value={val} key={val}>
                      {val}
                    </option>
                  ))}
                </select>
              </div>
              <div className={`${style.ivs}`}>
                <div>
                  <label className="iv-label">{strings.ivs} </label>
                </div>
                <div>
                  <span className={style.ivLabel}>{strings.attack_abbr}</span>
                  <select
                    className="atk"
                    name="atk"
                    id="atk"
                    onChange={handlePokemonChange}
                    value={addToBox.iv.atk}
                  >
                    {ivValues.map((val: number) => (
                      <option value={val} key={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className={style.ivLabel}>{strings.defense_abbr}</span>
                  <select
                    className="def"
                    name="def"
                    id="def"
                    onChange={handlePokemonChange}
                    value={addToBox.iv.def}
                  >
                    {ivValues.map((val: number) => (
                      <option value={val} key={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className={style.ivLabel}>
                    {strings.hitpoints_abbr}{' '}
                  </span>
                  <select
                    className="hp"
                    name="hp"
                    id="hp"
                    onChange={handlePokemonChange}
                    value={addToBox.iv.hp}
                  >
                    {ivValues.map((val: number) => (
                      <option value={val} key={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </TriangleTooltip>
        </div>
      ) : null}
      {suggestions && suggestions.size > 0 ? (
        <div className={style.searchbar}>
          {classSelector()}
          <Input
            title="Species"
            type="text"
            placeholder={
              member ? getSpeciesName(member) : strings.choose_pokemon
            }
            onChange={onChange}
            onKeyDown={onKeyDown}
            value={userInput}
          />
          {showSuggestions && userInput ? (
            filteredSuggestions && filteredSuggestions.length ? (
              <div className={style.suggestionscontainer}>
                <ul className={style.suggestions}>
                  {filteredSuggestions.map(
                    (suggestion: string, index: number) => (
                      <li
                        className={classNames([
                          style.suggestion,
                          { [style.active]: index === activeSuggestion },
                        ])}
                        key={suggestion}
                        onClick={handleSetPokemon}
                      >
                        {suggestion}
                      </li>
                    )
                  )}
                </ul>
              </div>
            ) : (
              <p>{strings.suggestions_none}</p>
            )
          ) : null}
        </div>
      ) : (
        <p>{strings.connect_db_failed}</p>
      )}
    </div>
  )
}
export default TeamMemberSelector
