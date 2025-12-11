import { isTest } from '../util/util-debug'

export const ROLLS_WHEN_BUILDING_TEST_DATA = 1_000_000

// This is the default number of simulatons when using the site. Make sure this is used when you are done with your PR.
export const NUMBER_OF_ROLLS = 20000 as number

// Use this row when debugging. When only one fight is simulated, we log more data. See `LOG` variable below
// export const NUMBER_OF_ROLLS = 1 as number

// Sometimes it is a good idea to add a test simply to ensure that a mechanic isnt broken in the future.
// But then you want a "correct" simulation result to use in the test. Then use this number.
// When this high number is used, the final result is printed to the console when using the dev server.
// Then you can use that final number in your test, and future developers will notice if their change break your feature.
// export const NUMBER_OF_ROLLS = ROLLS_WHEN_BUILDING_TEST_DATA as number

export const ROLLS_BETWEEN_UI_UPDATE = 1000

export const LOG = NUMBER_OF_ROLLS === 1 && !isTest()
