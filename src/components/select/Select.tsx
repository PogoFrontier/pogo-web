import { SERVER } from "@config/index";
import { useState } from "react";
import { TeamMember } from "types/team";

interface SelectProps {
  team: TeamMember[]
  onSubmit: (values: number[]) => void
  requiredAmount?: number
}

const getImage = (sid: number): string => {
  return `${SERVER}/mini/${sid}.png`
}

const initialValues = [-1, -1, -1, -1, -1, -1];

const findNext = (map: number[], requiredAmount: number): number => {
  const i = map.findIndex(x => x === -1)
  return i > -1 ? i + 1 : requiredAmount
}

const Select: React.FC<SelectProps> = ({ team, onSubmit, requiredAmount }) => {
  const [values, setValues] = useState(initialValues)
  const [map, setMap] = useState(new Array<number>(requiredAmount!).fill(-1))
  const [count, setCount] = useState(0)
  const [current, setCurrent] = useState(1)

  const register = (index: number) => {
    const deepCopy = [...values]
    const deepMap = [...map]
    if (deepCopy[index] > -1) {
      deepMap[deepMap.findIndex(x => x === deepCopy[index])] = -1
      deepCopy[index] = -1
      setCount(count - 1)
    } else {
      if (count === requiredAmount) {
        deepCopy[deepCopy.findIndex(x => x === count)] = -1
        deepMap[deepMap.findIndex(x => x === count)] = -1
      } else {
        setCount(count + 1)
      }
      deepCopy[index] = current
      deepMap[current - 1] = current
    }
    setCurrent(findNext(deepMap, requiredAmount!))
    setValues(deepCopy)
    setMap(deepMap)
  }

  const submit = () => {
    onSubmit(map)
  }
  
  return (
    <form onSubmit={submit}>
      <div>
        {
          team.map((x, i) => (
            // tslint:disable-next-line jsx-no-lambda
            <button type="button" key={x.speciesId} onClick={() => register(i)}>
              <img src={getImage(x.sid)} alt={x.speciesName}/>
              {
                values[i] > -1 &&
                <div>
                  {values[i]}
                </div>
              }
            </button>
          ))
        }
      </div>
      <button type="submit" disabled={count === requiredAmount}>
        Start
      </button>
    </form>
  )
}

Select.defaultProps = {
  requiredAmount: 3
}

export default Select