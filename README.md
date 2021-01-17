# Project Grookey
An open source, web-based online battle simulator for Pokémon Go. This is the client side of the project, you can find the server side repository [here](https://github.com/DeveloperKhan/pogo-web-backend).

[![](http://img.youtube.com/vi/X_7nhgRWi3c/0.jpg)](http://www.youtube.com/watch?v=X_7nhgRWi3c "")

## Table of Contents
  * [Introduction](#introduction)
  * [Installation](#installation)
  * [Project Status](#project-status)
  * [Contribute](#contribute)
  * [Author](#author)
  * [Credit](#credit)

## Introduction
Project Grookey (WIP name) aims to recreate the Pokémon Go battling feature in an online web environment. A user should open their browser, build a team, find an opponent, and have a full Pokémon battle. We plan only to simulate battling, so we heavily encourage everyone to also play the Pokémon Go mobile app. Through Project Grookey, we hope both new and current players become further invested in the game's community.

## Installation
Project Grookey is a NextJs + Express + WebSocket application. To run this project, you need to clone both this frontend repository and our [backend repository](https://github.com/DeveloperKhan/pogo-web-backend). This README only covers the installation instructions for the frontend. I recommend setting up the backend first.

After cloning this repository and navigating to its directory, open up your command line and run:
1. ```npm install```
2. ```npm run dev```

<b>Note:</b> If you haven't used npm before, make sure to [install](https://www.npmjs.com/get-npm) it first.

## Project Status
Currently, this project is alpha. We plan to keep the initial build very minimal.

Our scope:
- Online Matchmaking
  - [ ] Team Builder
  - [x] Create Battle Rooms
  - [x] Join Battle Rooms
- Battling
  - [x] Team Selection
  - [x] Fast Moves
  - [x] Charge Moves
  - [x] Switching
 
We'll often update this repository with our progress. You can get the MOST up to date information from our [Trello board](https://trello.com/b/MTKTjFOA/pogo). Many similar projects have stalled, so we will keep our progress very public to not suffer the same fate.

## Contribute
If you would like to contribute, feel free to reach out to AdibKhan on Discord (ImaDerpopotimus#5314). We haven't made an issues yet, but we are happy to receive PRs if you believe you can improve the project. If you have suggestions or feedback, [submit a survey](https://adibkhan127863.typeform.com/to/Ef2OER1h).

## Author
Hi, I'm Adib. I've been a competitive PoGo player for a little over a year and was at one point (December 4th) the [#1 ranked player in the world](https://ibb.co/Tq2mG2N). I love the game and its supportive, heartwarming community. I'm building Project Grookey as another way the community can connect, especially for players who may not have every Pokémon or looking for stress-free practice.

## Credit
Credit to [the PvPoke team](https://github.com/pvpoke/pvpoke) for my understanding of game mechanics and this project's game data. Special thanks to Mr. PvPoke AKA Empoleon_Dynamite AKA KakunaMattata42 for spearheading the PvPoke project and answering some of my key questions.

Credit to [Smogon](https://github.com/smogon/sprites) for all sprites.
