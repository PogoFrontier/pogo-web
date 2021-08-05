import { Anim } from "@adibkhan/pogo-web-backend";
import { keyframes } from "styled-components";

const WiggleAnimation = (back?: boolean) => keyframes`
    display: ${back ? "block" : "inline-block"}
`

const animateChar = (anim?: Anim, back?: boolean) => {
    if (!anim || !anim.move || !anim.move.animation || !anim.move.animation.self) {
        return ''
    }
    switch (anim.move.animation.self) {
        case "wiggle":
            return WiggleAnimation(back)
    }
}

export default animateChar
