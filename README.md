# Twilight Imperium 4 PoK battle calculator

This is a web application to get the odds of battles in TI4 PoK. It can be found at [ti4battle.com](https://ti4battle.com). The goal of creating yet another battle calculator is to have a battle calculator that fulfills all these points:

- Page load and battle simulation should feel quick and responsive while still being precise. We use web workers and progressive result updating to achieve this.
- The page should look good both on desktop and mobile.
- Simulating all mechanics, even complicated once such as the Sardakk mech and the Mentak hero.
- The application should be bug free. We have a whole battery of tests to minimize the number of bugs.
- The application should be updated when new codex and expansions are released.

On a more technical note, the implementation of the battle simulator should be as flexible as possible. It should be possible for a programmer to easily and quickly clone the project and add a complex homebrew faction. Perhaps someday we will add an interface for adding homebrew rules directly in the application.

## Technical details

We don't use a state machines or other smart algorithms, because certain mechanics would make these algorithms very complex. So we just use the Monte Carlo method, simulating thousands of battles.

### Code

This is a [Next.js](https://nextjs.org/) project written in Typescript. The root interface can be found in `pages/index.tsx`. The battle simulation code can be found in the `core` folder.

To run the project, first install all dependencies:

```bash
npm install
```

Then start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and hopefully everything is working :)

You will find the simulation code is in the "core" package, and all other stuff is frontend stuff. If you are interesting in helping out, make sure to check out the `constant.ts` file. It has some helpful suggestions for testing out the code.

BE AWARE: Sometimes the test suite will fail, simply because it works by running the simulation hundred of thousands of times, and sometimes due to randomness it gets result outside of an accepted limit and fails. Most tests use a system where they will iterate several times on failure to ensure it wasn't an anomaly. So if your tests fails, try to run them again. They should almost always pass. If they fail often, then something in the code is wrong.

### Release

We use docker, so this command will release created a container with a prod build:

```
docker compose up -d --build
```
