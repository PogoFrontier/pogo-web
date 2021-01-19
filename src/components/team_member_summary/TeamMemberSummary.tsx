import getImage from '@common/actions/getImage'
import React from 'react'

const TeamMemberSummary = (props: { member: any }) => {
  const { member } = props

  const toTitleCase = (text: string) => {
    return text
      .toLowerCase()
      .split('_')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ')
  }

  return (
    <div>
      <label>Pokemon: {member.speciesName}</label>
      <br />
      <div className="pokemon-info">
        <div className="choice-btns">
          <button>Edit</button>
        </div>
        <label className="cp">CP: {member.cp}</label>
        <br />
        <label className="types">
          {member.types.map(
            (type: string) =>
              type !== 'none' && <span key={type}>{toTitleCase(type)} </span> // Later make this a custom component
          )}
        </label>
        <br />
        <img
          src={getImage(member.sid, member.shiny, false)}
          alt={member.speciesName}
          className="sprite"
        />
        <br />
        <label className="shiny-label">
          Shiny?{' '}
          <input
            type="checkbox"
            name="shiny"
            id="shiny"
            checked={member.shiny ? member.shiny : false}
            readOnly={true}
          />
        </label>
        <br />
        <label className="name-label">
          Nickname: {member.name ? member.name : 'none'}
        </label>
        <br />
        <div className="moves">
          <label className="fast-move-label">Fast Move: </label>
          <label className="fast-move">{toTitleCase(member.fastMove)}</label>
          <br />
          <table className="charge-moves-table">
            <tbody>
              <tr>
                <td>
                  <label className="charge-move-label">Charge Moves: </label>
                </td>
                <td>
                  <label className="charge-move-1">
                    {toTitleCase(member.chargeMoves[0])}
                  </label>
                </td>
              </tr>
              <tr>
                <td />
                <td>
                  <label className="charge-move-2">
                    {toTitleCase(member.chargeMoves[1])}
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
          <br />
        </div>
        <div className="stats">
          <div className="level">
            <label className="level-label"> Level: {member.level}</label>
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
                    <label className="atk">{member.iv.atk}</label>
                  </td>
                  <td>
                    <label className="def">{member.iv.def}</label>
                  </td>
                  <td>
                    <label className="hp">{member.iv.hp}</label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamMemberSummary
