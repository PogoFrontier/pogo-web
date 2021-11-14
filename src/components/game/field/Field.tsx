import { Anim } from '@adibkhan/pogo-web-backend'
import { Actions } from '@adibkhan/pogo-web-backend/actions'
import { useMoves } from '../../contexts/PokemonMovesContext'
import LanguageContext from '@context/LanguageContext'
import classnames from 'classnames'
import { useEffect, useState, useRef, useContext, useCallback } from 'react'
import Character, { CharacterProps } from './Character'
import style from './field.module.scss'

interface FieldProps {
  characters: [CharacterProps, CharacterProps]
  message?: string
}

interface Message extends Anim {
  message: string
}

interface LogMessageProps {
  value: Anim | Message
}

const AlwaysScrollToBottom = () => {
  const elementRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView()
    }
  })
  return <div ref={elementRef} />
}

const toTitleCase = (text: string) => {
  return text
    .toLowerCase()
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ')
}

const LogMessage: React.FunctionComponent<LogMessageProps> = ({ value }) => {
  const [moves] = useMoves() || []
  const { current } = useContext(LanguageContext)

  const getMoveName = useCallback(
    (move: string): string => {
      return (
        moves?.[move]?.name[current] ||
        moves?.[move]?.name.en ||
        toTitleCase(move)
      )
    },
    [moves, current]
  )

  const eventuallyReplaceMove = useCallback((sentence: string): string => {
    const regex = /.*?{(.+?)}.*/
    const matches = regex.exec(sentence)
    const toReplace = matches?.[1]
    let retval = sentence
    if (toReplace) {
      retval = sentence.replace(`{${toReplace}}`, getMoveName(toReplace))
    }
    return retval
  }, [])

  const render = () => {
    const strings = useContext(LanguageContext).strings
    switch (value.type) {
      case 'faint':
        return <>{strings.knock_out}</>
      case Actions.FAST_ATTACK:
        return (
          <>
            {strings.used}
            <strong
              className={classnames([style.move, style[value.move!.type]])}
            >
              {getMoveName(value.move!.moveId)}
            </strong>
            .
          </>
        )
      case Actions.SWITCH:
        return <>{strings.switching}.</>
      case Actions.CHARGE_ATTACK:
        return <>{strings.charging}</>
    }
    const v = value as Message
    if (v.message) {
      return <>{eventuallyReplaceMove(v.message)}</>
    }
  }
  return (
    <div className={style.logItem}>
      {value.turn !== undefined && (
        <>
          <strong className={style.hide}>{'Turn '}</strong>
          <strong>{`${value.turn}: `}</strong>
        </>
      )}
      {render()}
    </div>
  )
}

const Field: React.FunctionComponent<FieldProps> = ({
  characters,
  message,
}) => {
  const [messages, setMessages] = useState<(Message | Anim)[]>([])
  useEffect(() => {
    if (
      characters[1].anim &&
      (messages.length === 0 ||
        characters[1].anim !== messages[messages.length - 1])
    ) {
      setMessages((prev) => {
        const newM = [...prev]
        newM.push(characters[1].anim!)
        return newM
      })
    }
  }, [characters[1].anim])
  useEffect(() => {
    if (message) {
      setMessages((prev) => {
        const newM = [...prev]
        const d: Message = {
          message: message!,
          type: 'message',
        }
        newM.push(d)
        return newM
      })
    }
  }, [message])
  return (
    <section className={style.root}>
      <div className={style.log}>
        {messages.map((x: any, i: number) => (
          <LogMessage value={x} key={`${x.turn}${i}`} />
        ))}
        <AlwaysScrollToBottom />
      </div>
      <div className={style.player}>
        <Character
          char={characters[0].char}
          anim={characters[0].anim}
          back={true}
        />
      </div>
      <Character char={characters[1].char} anim={characters[1].anim} />
    </section>
  )
}

export default Field
