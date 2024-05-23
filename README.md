# AS Lab

## Description

Website: https://as.lovelive-lab.fans

This project is a React web application showcasing my skills in development and clean code practices. This site is an unofficial fan site for Love Live! School Idol Festival All Stars (AS), operated as a hobby. It provides features to enhance your enjoyment of AS, including Live Formation simulations. The simulation helps maximize the voltage of your Main and SP strategies by considering skill factors.

## Setup Instructions

In the root directory, run `yarn install` to install all required dependencies.

### Core

1. Navigate to `/packages/core`.
2. Build the package by running `yarn build`.

### Web

1. Ensure the dist directory exists under `/packages/core`.
2. Navigate to `/packages/web`.
3. Add environment variables to `.env.development` and `.env.production`
4. Update the default project name in  `.firebaserc`.
5. Run the package by executing `yarn start`.
6. Open http://localhost:3000 in a browser to view the client application.

## Code Overview

Under `/packages`:

- `core`: Contains logic for simulations and other functionalities used by the client.
- `proxy`: Experimental code for retrieving data from the original game.
- `web`: Code for the client website powered by React.

## Technologies Used

- Yarn workspaces
- Firebase
- Lerna
- TypeScript
- React
- Navi
- React Query
- axios
- styled-components
