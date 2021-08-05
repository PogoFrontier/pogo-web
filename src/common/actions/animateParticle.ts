import { MoveAnimParticle } from "@adibkhan/pogo-web-backend";
import { keyframes } from "styled-components";

const Animation = (particle: MoveAnimParticle) => keyframes`
    ${calculateKeyframes(particle)}
`

const calculateKeyframes = (particle: MoveAnimParticle) => {
    if (!particle) {
        return ''
    }

    return ''
}

const animateParticle = (particle: MoveAnimParticle, back?: boolean) => {
    if (!particle) {
        return ''
    }
    if (!back) {
        return ''
    }

    return `
        animation: ${Animation(particle)}
    `
}

export default animateParticle