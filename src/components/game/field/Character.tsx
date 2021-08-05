import classnames from 'classnames'
import style from './character.module.scss'
import getColor from '@common/actions/getColor'
import ImageHandler from '@common/actions/getImages'
import { Anim, TeamMember, MoveAnimParticle } from '@adibkhan/pogo-web-backend'
import styled from 'styled-components'
import animateChar from '@common/actions/animateChar'
import animateParticle from '@common/actions/animateParticle'

const chargedDuration = 3000

export interface CharacterProps {
  anim?: Anim
  char?: TeamMember
  back?: boolean
}

interface CharProps {
  anim?: Anim
  back?: boolean
}

interface ParticleProps {
  particle: MoveAnimParticle
  duration: number
  back?: boolean
}

const Char = styled.img<CharProps>`
  display: block;
  margin: auto;
  ${({ anim, back }) => animateChar(anim, back)}
`

const Particle = styled.img<ParticleProps>`
  position: absolute;
  ${({ particle, back }) => animateParticle(particle, back)}
  animation-duration: ${({duration}) => duration}ms;
`

const Character: React.FunctionComponent<CharacterProps> = ({
  char,
  back,
  anim,
}) => {
  const imagesHandler = new ImageHandler()

  if (!char) {
    return <div />
  }

  const ratio = char.current!.hp
  const color = getColor(ratio)

  return (
    <div className={style.root}>
      <div className={style.healthbar}>
        <div
          className={style.health}
          style={{ width: `${ratio * 100}%`, backgroundColor: color }}
        />
      </div>
      <div
        className={classnames(style.imgcontainer, {
          [style.back]: back,
        })}
      >
        {
          anim && anim.move && anim.move.animation && anim.move.animation.particles.map(
            (x, i) => (
              <Particle
                key={`${i}`}
                src={require(`../../../assets/img/fx/${x.name}.png`)}
                particle={x}
                duration={anim.move?.type === "ca" ? chargedDuration : anim.move!.cooldown!}
                back={back}
              />
            )
          )
        }
        <Char
          draggable="false"
          src={imagesHandler.getImage(char.sid, char.shiny, back)}
          anim={anim}
          back={back}
          alt={typeof char.speciesName === "string"
          ? char.speciesName
          : char.speciesId}
        />
      </div>
    </div>
  )
}

export default Character
