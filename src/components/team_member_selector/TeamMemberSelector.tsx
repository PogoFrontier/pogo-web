import React, { useEffect, useState } from 'react'
import {
  getPokemonData,
  getPokemonNames,
} from '@common/actions/pokemonAPIActions'
import { cpms, ivValues, levelValues, shadowMult } from '@config/statVals'
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

let pokemonNames: string[]
getPokemonNames().then((data) => (pokemonNames = Object.keys(data)))

const TeamMemberSelector = (props: {
  cancelEdit: () => void
  savePokemon: (pokemon: any) => void
  member: TeamMember
  deletePokemon: () => void
  meta: string
}) => {
  const { cancelEdit, savePokemon, member, deletePokemon, meta } = props
  const [userInput, setUserInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [activeSuggestion, setActiveSuggestion] = useState(0)
  const [filteredSuggestions, setFilteredSuggestions] = useState([] as any)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedPokemonData, setSelectedPokemonData] = useState<any | null>(
    null
  )
  const [addToBox, setAddToBox] = useState<any | null>(null)
  const [shouldSave, setShouldSave] = useState<boolean>(false)

  const imageHandler = new ImageHandler()

  useEffect(() => {
    if (member && member.speciesName) {
      setAddToBox(member)
      getPokemonData(member.speciesId, metaMap[meta].movesetOption).then(
        (pokemon) => {
          if (pokemon) {
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
    if (pokemonNames) {
      setSuggestions(pokemonNames)
    } else {
      return
    }
  }, [suggestions])

  const onChange = (e: any) => {
    const input: string = e.currentTarget.value
    setUserInput(input)
    setFilteredSuggestions(
      suggestions.filter(
        (s) => s.toLowerCase().indexOf(input.toLowerCase()) > -1
      )
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

  const setPokemon = (input: string) => {
    setUserInput(input)
    getPokemonData(parseName(input), metaMap[meta].movesetOption)
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
          setAddToBox({
            speciesId: pokemon.speciesId,
            speciesName: pokemon.speciesName,
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
            fastMove: pokemon.fastMoves[0],
            chargeMoves: pokemon.chargedMoves.slice(0, 2),
            sid: pokemon.sid,
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
      alert('This Pokemon has corrupted data!')
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

  return (
    <div className={style.container}>
      {selectedPokemonData && addToBox ? (
        <div className={style.info}>
          <span className={style.btnRow}>
            {!member ? (
              <button className={style.exit} onClick={cancel}>
                Cancel
              </button>
            ) : (
              <button className={style.exit} onClick={handleDelete}>
                Delete
              </button>
            )}
          </span>
          <label className={style.cp}>{addToBox.speciesName}</label>
          <br />
          <label className={style.cp}>
            CP <b>{addToBox.cp}</b>
          </label>
          <br />
          <TypeIcons types={addToBox.types} />
          <br />
          <div className={style.imagecontainer}>
            <img
              src={imageHandler.getImage(addToBox.sid, addToBox.shiny, false)}
              key={imageHandler.getImage(addToBox.sid, addToBox.shiny, false)}
              alt={addToBox.speciesName}
              className="sprite"
            />
          </div>
          <br />
          <div className={style.label}>
            <label className="shiny-label">
              Shiny?{' '}
              <input
                type="checkbox"
                name="shiny"
                id="shiny"
                checked={addToBox.shiny ? addToBox.shiny : false}
                onChange={handlePokemonChange}
              />
            </label>
            <br />
            <label className="name-label">Nickname: </label>
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
              Clear
            </button>
          </div>

          <div className={`fast-move ${style.label}`}>
            <label className="fast-move-label">Fast Move: </label>
            <select
              className="fast-moves-select"
              name="fast-moves-select"
              id="fastMove"
              onChange={handlePokemonChange}
              value={addToBox.fastMove}
            >
              {selectedPokemonData.fastMoves.map((move: string) => (
                <option value={move} key={move}>
                  {toTitleCase(move)}
                </option>
              ))}
            </select>
          </div>
          <div className={style.label}>
            <label className="charge-move-label">Charge Moves: </label>
            <select
              className="charge-move-1"
              name="charge-move-1"
              id="chargeMove1"
              onChange={handlePokemonChange}
              value={addToBox.chargeMoves[0]}
            >
              {selectedPokemonData.chargedMoves.map((move: string) => (
                <option value={move} key={move}>
                  {toTitleCase(move)}
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
                  {toTitleCase(move)}
                </option>
              ))}
            </select>
          </div>
          <div className="stats">
            <div className={`level ${style.label}`}>
              <label className="level-label"> Level: </label>
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
            <div className={`ivs ${style.label}`}>
              <label className="iv-label">IVs : </label>
              ATK
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
              DEF
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
              HP
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
      ) : null}
      {suggestions && suggestions.length > 0 ? (
        <div className={style.searchbar}>
          <Input
            title="Species"
            type="text"
            placeholder={member ? member.speciesName : 'Choose Pokemon'}
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
              <p>No suggestions</p>
            )
          ) : null}
        </div>
      ) : (
        <p>Failed to connect to the Pokemon database</p>
      )}
    </div>
  )
}
export default TeamMemberSelector
