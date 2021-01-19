import React, { useEffect, useState } from 'react'
import {
  getPokemonData,
  getPokemonNames,
} from '@common/actions/pokemonAPIActions'
import { cpms, ivValues, levelValues } from '@config/statVals'
import getImage from '@common/actions/getImage'

const TeamMemberSelector = (props: {
  cancelEdit: () => void
  savePokemon: (pokemon: any) => void
}) => {
  const { cancelEdit, savePokemon } = props
  const [userInput, setUserInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [activeSuggestion, setActiveSuggestion] = useState(0)
  const [filteredSuggestions, setFilteredSuggestions] = useState([] as any)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedPokemonData, setSelectedPokemonData] = useState<any | null>(
    null
  )
  const [addToBox, setAddToBox] = useState<any | null>(null)

  useEffect(() => {
    getPokemonNames().then((names) => {
      if (names.length > 0) {
        setSuggestions(names)
      } else {
        return
      }
    }) // .catch(err => console.log(err));//should show 404 page
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

  const setPokemon = (input: string) => {
    setUserInput(input)
    getPokemonData(input.toLowerCase().replace(/[()]/g, '').replace(/\s/g, '_'))
      .then((pokemon) => {
        if (pokemon) {
          setActiveSuggestion(0)
          setFilteredSuggestions([])
          setShowSuggestions(false)
          setSelectedPokemonData(pokemon)
          const selectedIVs = [40, 15, 15, 15] // change this later to be calced
          const cpm = cpms[(selectedIVs[0] - 1) * 2]
          const selectedHP = Math.floor(
            (pokemon.baseStats.hp + selectedIVs[3]) * cpm
          )
          const selectedAtk = (pokemon.baseStats.atk + selectedIVs[1]) * cpm
          const selectedDef = (pokemon.baseStats.def + selectedIVs[2]) * cpm
          setAddToBox({
            speciesId: pokemon.speciesId,
            speciesName: pokemon.speciesName,
            hp: selectedHP,
            atk: selectedAtk,
            def: selectedDef,
            level: selectedIVs[0],
            iv: {
              atk: selectedIVs[1],
              def: selectedIVs[2],
              hp: selectedIVs[3],
            },
            cp: Math.floor(
              (pokemon.baseStats.atk + selectedIVs[1]) *
                Math.sqrt(pokemon.baseStats.def + selectedIVs[2]) *
                Math.sqrt(pokemon.baseStats.hp + selectedIVs[3]) *
                cpms[(selectedIVs[0] - 1) * 2] *
                cpms[(selectedIVs[0] - 1) * 2] *
                0.1
            ),
            types: pokemon.types,
            fastMove: pokemon.fastMoves[0],
            chargeMoves: pokemon.chargedMoves.slice(0, 2),
            sid: pokemon.sid,
          })
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

  const calcCP = (stats: number[]) => {
    const bs = selectedPokemonData.baseStats
    const cpm = cpms[(stats[0] - 1) * 2]
    const atk = stats[1]
    const def = stats[2]
    const hp = stats[3]
    const cp =
      (bs.atk + atk) *
      Math.sqrt(bs.def + def) *
      Math.sqrt(bs.hp + hp) *
      cpm *
      cpm *
      0.1
    return Math.floor(cp)
  }

  const handlePokemonChange = (e: any) => {
    if (['level', 'atk', 'def', 'hp'].includes(e.target.id)) {
      const statsObj: any = {
        level: addToBox.level,
        atk: addToBox.iv.atk,
        def: addToBox.iv.def,
        hp: addToBox.iv.hp,
      }
      statsObj[e.target.id] = +e.target.value
      const newCP = calcCP([
        statsObj.level,
        statsObj.atk,
        statsObj.def,
        statsObj.hp,
      ])
      // later, check newCP against the CP cap of the meta
      if (e.target.id === 'level') {
        setAddToBox((prevState: any) => ({
          ...prevState,
          level: +e.target.value,
          cp: newCP,
        }))
      } else {
        const newIVs = { ...addToBox.iv }
        newIVs[e.target.id] = +e.target.value
        setAddToBox((prevState: any) => ({
          ...prevState,
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
      setAddToBox((prevState: any) => ({
        ...prevState,
        [e.target.id]: e.target.checked,
      }))
    } else if (e.target.id.startsWith('name')) {
      e.target.id === 'name-clear'
        ? handleNicknameChange('')
        : handleNicknameChange(e.target.value)
    } else {
      setAddToBox((prevState: any) => ({
        ...prevState,
        [e.target.id]: e.target.value,
      }))
    }
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
  }

  const handleSavePokemon = () => {
    savePokemon(addToBox)
  }

  return (
    <div>
      <h4>Adding New Pokemon</h4>
      {suggestions && suggestions.length > 0 ? (
        <table className="pokemon-input">
          <tbody>
            <tr>
              <td>
                <label>Pokemon: </label>
              </td>
              <td>
                <input
                  type="text"
                  onChange={onChange}
                  onKeyDown={onKeyDown}
                  value={userInput}
                />
              </td>
            </tr>
            <tr>
              <td />
              <td>
                {showSuggestions && userInput ? (
                  filteredSuggestions && filteredSuggestions.length ? (
                    <ul
                      className="suggestions"
                      style={{ listStyleType: 'none' }}
                    >
                      {filteredSuggestions.map(
                        (suggestion: string, index: number) => (
                          <li
                            className={
                              index === activeSuggestion
                                ? 'suggestion-active'
                                : ''
                            }
                            key={suggestion}
                            onClick={handleSetPokemon}
                          >
                            {suggestion}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <div className="no-suggestions" />
                  )
                ) : null}
              </td>
            </tr>
          </tbody>
        </table>
      ) : null}
      {selectedPokemonData && addToBox ? (
        <div className="pokemon-info">
          <div className="choice-btns">
            <button className="cancel-btn" onClick={cancel}>
              Cancel
            </button>
            <button className="save-btn" onClick={handleSavePokemon}>
              {' '}
              Save
            </button>
          </div>
          <label className="cp">CP: {addToBox.cp}</label>
          <br />
          <label className="types">
            {addToBox.types.map(
              (type: string) =>
                type !== 'none' && <span key={type}>{toTitleCase(type)} </span> // Later make this a custom component
            )}
          </label>
          <br />
          <img
            src={getImage(addToBox.sid, addToBox.shiny, false)}
            alt={addToBox.speciesName}
            className="sprite"
          />
          <br />
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
            placeholder="none"
            id="name"
            onChange={handlePokemonChange}
            value={addToBox.name ? addToBox.name : ''}
          />
          <button
            className="clear-name-btn"
            id="name-clear-btn"
            onClick={handlePokemonChange}
          >
            Clear
          </button>
          <br />
          <div className="fast-move">
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
          <br />
          <table className="charge-moves-table">
            <tbody>
              <tr>
                <td>
                  <label className="charge-move-label">Charge Moves: </label>
                </td>
                <td>
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
                </td>
              </tr>
              <tr>
                <td />
                <td>
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
                </td>
              </tr>
            </tbody>
          </table>
          <br />
          <div className="stats">
            <div className="level">
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
            <div className="ivs">
              <label className="iv-label">IVs: </label>
              <table className="iv-table">
                <tbody>
                  <tr>
                    <td>Attack</td>
                    <td>Defense</td>
                    <td>HP</td>
                  </tr>
                  <tr>
                    <td>
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
                    </td>
                    <td>
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
                    </td>
                    <td>
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
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
export default TeamMemberSelector
