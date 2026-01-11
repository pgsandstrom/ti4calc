import { isTest } from '../util/util-debug'

export const ROLLS_WHEN_BUILDING_TEST_DATA = 1_000_000

// This is the default number of simulations when using the site. Make sure this is used when you are done with your PR.
export const NUMBER_OF_ROLLS = 20000 as number

// Use this row when debugging. When only one fight is simulated, we log a bunch of data to the browser console. See `LOG` variable below
// export const NUMBER_OF_ROLLS = 1 as number

// Number of simulations to run in tests. Default is 20000.
// Set to 1 to enable detailed battle logging in test output.
// Set to ROLLS_WHEN_BUILDING_TEST_DATA to get accurate percentages for new tests.
export const TEST_NUMBER_OF_ROLLS = 20_000 as number
// export const TEST_NUMBER_OF_ROLLS = 1 as number
// export const TEST_NUMBER_OF_ROLLS = ROLLS_WHEN_BUILDING_TEST_DATA

export const ROLLS_BETWEEN_UI_UPDATE = 1000

// Enable detailed battle logging when running single simulations
// Works both in browser (NUMBER_OF_ROLLS = 1) and in tests (TEST_NUMBER_OF_ROLLS = 1)
export const LOG = (NUMBER_OF_ROLLS === 1 && !isTest()) || (TEST_NUMBER_OF_ROLLS === 1 && isTest())
