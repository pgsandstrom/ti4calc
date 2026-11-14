import { describe, it } from "node:test"

import { TEST_NUMBER_OF_ROLLS } from "@/core/constant"
import { getTestParticipant, testBattleReport } from "@/util/util.test"

describe("Obsidian", () => {
  it("Obsidian flagship should have 3 dice at combat 5", () => {
    const attacker = getTestParticipant(
      "attacker",
      {
        flagship: 1,
      },
      "Obsidian",
    )

    const defender = getTestParticipant("defender", {
      cruiser: 1,
    })

    // Flagship: 3 dice at 5 (50% each), has sustain
    // Cruiser: 1 die at 7 (40%)
    // Flagship almost always wins due to sustain and superior firepower
    testBattleReport(attacker, defender, "space", TEST_NUMBER_OF_ROLLS, [
      { side: "attacker", percentage: 0.989 },
      { side: "draw", percentage: 0.01 },
      { side: "defender", percentage: 0.001 },
    ])
  })

  it("Obsidian Agent should force opponent to destroy a ship of the same type when own ship dies", () => {
    const attacker = getTestParticipant(
      "attacker",
      {
        destroyer: 2,
      },
      "Obsidian",
      {
        "Obsidian Agent": 1,
      },
    )

    const defender = getTestParticipant("defender", {
      destroyer: 2,
    })

    // Without agent this would be ~46.5% each side (symmetric)
    // With agent, when an attacker destroyer dies, a defender destroyer is also destroyed
    testBattleReport(attacker, defender, "space", TEST_NUMBER_OF_ROLLS, [
      { side: "attacker", percentage: 0.74 },
      { side: "draw", percentage: 0.063 },
      { side: "defender", percentage: 0.197 },
    ])
  })

  it("Obsidian Agent should only be used once per battle", () => {
    const attacker = getTestParticipant(
      "attacker",
      {
        destroyer: 3,
      },
      "Obsidian",
      {
        "Obsidian Agent": 1,
      },
    )

    const defender = getTestParticipant("defender", {
      destroyer: 3,
    })

    // If the agent could be used more than once, the attacker would win almost every battle
    testBattleReport(attacker, defender, "space", TEST_NUMBER_OF_ROLLS, [
      { side: "attacker", percentage: 0.72 },
      { side: "draw", percentage: 0.028 },
      { side: "defender", percentage: 0.252 },
    ])
  })

  it("Obsidian Agent should not trigger when opponent ships are destroyed", () => {
    // Defender has no ships matching the attacker's dreadnoughts, so the agent can never be used.
    // Result should be identical to a battle without the agent.
    const units = { dreadnought: 2 }
    const defenderUnits = { destroyer: 1, cruiser: 2 }
    const expected = [
      { side: "attacker", percentage: 0.845 },
      { side: "draw", percentage: 0.047 },
      { side: "defender", percentage: 0.108 },
    ] as const

    testBattleReport(
      getTestParticipant("attacker", units, "Obsidian", { "Obsidian Agent": 1 }),
      getTestParticipant("defender", defenderUnits),
      "space",
      TEST_NUMBER_OF_ROLLS,
      [...expected],
    )
    testBattleReport(
      getTestParticipant("attacker", units, "Obsidian"),
      getTestParticipant("defender", defenderUnits),
      "space",
      TEST_NUMBER_OF_ROLLS,
      [...expected],
    )
  })

  it("Obsidian Agent should not trigger in ground combat", () => {
    const attacker = getTestParticipant(
      "attacker",
      {
        infantry: 2,
      },
      "Obsidian",
      {
        "Obsidian Agent": 1,
      },
    )

    const defender = getTestParticipant("defender", {
      infantry: 2,
    })

    // Agent only works in space, ground combat is symmetric 2v2 infantry
    testBattleReport(attacker, defender, "ground", TEST_NUMBER_OF_ROLLS, [
      { side: "attacker", percentage: 0.465 },
      { side: "draw", percentage: 0.07 },
      { side: "defender", percentage: 0.465 },
    ])
  })

  it("Obsidian Commander should give +1 to combat rolls", () => {
    const attacker = getTestParticipant(
      "attacker",
      {
        cruiser: 2,
      },
      "Obsidian",
      {
        "Obsidian Commander": 1,
      },
    )

    const defender = getTestParticipant("defender", {
      cruiser: 2,
    })

    // Commander gives +1 to combat, so cruisers hit on 6 instead of 7
    // This should favor the attacker
    testBattleReport(attacker, defender, "space", TEST_NUMBER_OF_ROLLS, [
      { side: "attacker", percentage: 0.54 },
      { side: "draw", percentage: 0.135 },
      { side: "defender", percentage: 0.325 },
    ])
  })

  it("Asail plot card should give +1 to all combat rolls", () => {
    const attacker = getTestParticipant(
      "attacker",
      {
        cruiser: 2,
      },
      "Obsidian",
      {
        "Asail (Obsidian)": 1,
      },
    )

    const defender = getTestParticipant("defender", {
      cruiser: 2,
    })

    // Asail gives +1 to combat, so cruisers hit on 6 instead of 7
    testBattleReport(attacker, defender, "space", TEST_NUMBER_OF_ROLLS, [
      { side: "attacker", percentage: 0.54 },
      { side: "draw", percentage: 0.135 },
      { side: "defender", percentage: 0.325 },
    ])
  })
})
