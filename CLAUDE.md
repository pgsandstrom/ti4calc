# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TI4 Battle Calculator - A Monte Carlo-based battle simulator for Twilight Imperium 4 (with Prophecy of Kings expansion). Uses web workers for responsive UI with progressive result updates.

Live site: [ti4battle.com](https://ti4battle.com)

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (uses Turbopack)
npm run build        # Production build
npm run test         # Run all tests
npm run test -- path/to/file.test.ts   # Run single test file
npm run lint         # ESLint (zero warnings allowed)
npm run typecheck    # TypeScript type checking
npm run format       # Prettier formatting
npm run pre-push     # Full CI check (lint + test + typecheck)
```

Docker deployment:

```bash
docker compose up -d --build
```

## Architecture

### Core Simulation (`/core`)

The battle simulator uses Monte Carlo simulation (thousands of battles, not state machines) because TI4 mechanics are too complex for analytical solutions.

**Key files:**

- `battle.ts` - Main battle loop: bombardment → space cannon → AFB → combat rounds. The `doBattle()` function orchestrates all phases.
- `battleSetup.ts` - Creates `BattleInstance` from `Battle`. Applies battle effects, unit upgrades, and damage.
- `battle-types.ts` - Core types: `Battle`, `Participant`, `BattleInstance`, `ParticipantInstance`. Important effect hooks: `beforeStart`, `onStart`, `onSustain`, `onCombatRound`, `onDeath`, etc.
- `unit.ts` - Unit definitions and `Roll` interface for dice mechanics.
- `webworker.ts` - Runs simulation in background with progressive updates to UI.

**Battle effects system:**

- `battleeffect/battleEffects.ts` - `BattleEffect` interface with hooks for every combat timing window
- Effects are sorted by priority (higher runs first), faction abilities take precedence at same priority
- Unit "auras" (`BattleAura`) provide temporary combat-time modifiers

### Factions (`/core/factions`)

Each faction file exports battle effects for faction abilities, flagships, mechs, agents, commanders, heroes, and faction techs. Effects use the hook system from `BattleEffect`.

### Frontend (`/component`, `/pages`)

Next.js app with React. Main UI in `pages/index.tsx`. Components handle unit input, faction selection, options, and battle report display.

## Testing

Tests use Monte Carlo simulation, so **tests may occasionally fail due to randomness**. The test framework retries up to 10 times before actually failing. If a test fails, run it again before investigating.

**Test patterns:**

```typescript
import { getTestParticipant, testBattleReport } from '../util/util.test'

const attacker = getTestParticipant('attacker', { dreadnought: 2 }, Faction.barony_of_letnev, {
  'Effect Name': 1,
})
const defender = getTestParticipant('defender', { dreadnought: 2 })

testBattleReport(attacker, defender, Place.space, 500, [
  { side: 'attacker', percentage: 0.5 },
  { side: 'draw', percentage: 0.1 },
  { side: 'defender', percentage: 0.4 },
])
```

## Debugging Tips

In `core/constant.ts`:

- Set `NUMBER_OF_ROLLS = 1` for detailed logging of a single battle
- Set `NUMBER_OF_ROLLS = ROLLS_WHEN_BUILDING_TEST_DATA` (1M rolls) to generate precise percentages for new tests - results print to console
- Default for production: `NUMBER_OF_ROLLS = 20000`

The `LOG` constant enables verbose battle logging when running single simulations.
