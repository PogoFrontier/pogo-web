import { Move } from "@adibkhan/pogo-web-backend"
import { CharacterProps } from "@components/game/field/Character"
import Field from "@components/game/field/Field"
import { defaultTeam } from "@context/TeamContext"
import React, { useState } from "react"
import style from './style.module.scss'
import { v4 as uuidv4 } from 'uuid'

const defaultFa: Move = {
    "moveId": "MUD_SHOT",
    "name": "Mud Shot",
    "type": "ground",
    "power": 3,
    "energy": 0,
    "energyGain": 9,
    "cooldown": 1000,
    animation: {
        type: "fa",
        particles: [
            {
                startPos: {x: 0, y: 0},
                name: "mudwhisp",
                preset: "projectile"
            }
        ],
        self: "basic"
    }
}

const defaultCa: Move = {
    "moveId": "NIGHT_SLASH",
    "name": "Night Slash",
    "type": "dark",
    "power": 50,
    "energy": 35,
    "energyGain": 0,
    "cooldown": 500,
    animation: {
        type: "ca",
        particles: [
            {
                startPos: {x: 100, y: 0},
                keyframes: [
                    {
                        time: 0,
                        opacity: 0,
                        rotation: 45
                    },
                    {
                        time: 0.2,
                        opacity: 0
                    },
                    {
                        time: 0.3,
                        opacity: 1
                    },
                    {
                        time: 0.7,
                        pos: {x: 0, y: 0},
                    },
                    {
                        time: 0.8,
                        opacity: 0
                    }
                ],
                name: "rightslash",
                preset: "opponent"
            }
        ],
        background: {
            color: "#191970"
        },
        self: "jump"
    }
}

const TestPage: React.FC = () => {
    const [characters, setCharacters] = useState([
        {
            char: {
                ...defaultTeam.members[1],
                current: {
                    hp: 1,
                    def: defaultTeam.members[1].def,
                    atk: defaultTeam.members[1].atk,
                    status: [0, 0],
                    energy: 100
                }
            },
            back: true
        }, {
            char: {
                ...defaultTeam.members[0],
                current: {
                    hp: 1,
                    def: defaultTeam.members[0].def,
                    atk: defaultTeam.members[0].atk,
                    status: [0, 0],
                    energy: 100
                }
            }
        }
    ] as [
        CharacterProps,
        CharacterProps
    ])
    const [message, setMessage] = useState('')

    const testMessage = () => {
        setMessage(`${Math.random()}-Message`)
    }

    const testMove = (move: Move, char: 0 | 1, type: string) => {
        setCharacters((prev) => {
            const newPrev = { ...prev }
            prev[char].anim = {
                move,
                type,
                turn: -1,
                id: uuidv4()
            }
            return newPrev
        })
    }

    const testFaOpp = () => {
        testMove(defaultFa, 1, "fa")
    }

    const testFaPlayer = () => {
        testMove(defaultFa, 0, "fa")
    }

    const testCaOpp = () => {
        testMove(defaultCa, 1, "ca")
    }

    const testCaPlayer = () => {
        testMove(defaultCa, 0, "ca")
    }

    return (
        <div className={style.root}>
            <Field characters={characters} message={message} />
            <div className={style.controls}>
                <h2>Controls</h2>
                <button onClick={testMessage}>test message</button>
                <button onClick={testFaOpp}>test fast attack (opp)</button>
                <button onClick={testFaPlayer}>test fast attack (player)</button>
                <button onClick={testCaOpp}>test charge attack (opp)</button>
                <button onClick={testCaPlayer}>test charge attack (player)</button>
            </div>
        </div>
    )
}

export default TestPage