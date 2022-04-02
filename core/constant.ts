// we use "as number" so typescript dont whine about meaningless comparisons to this constant

import { isTest } from '../util/util-debug'

export const ROLLS_WHEN_BUILDING_TEST_DATA = 100000

// export const NUMBER_OF_ROLLS = ROLLS_WHEN_BUILDING_TEST_DATA as number
// export const NUMBER_OF_ROLLS = 1 as number
export const NUMBER_OF_ROLLS = 20000 as number

export const ROLLS_BETWEEN_UI_UPDATE = 1000

// eslint-disable-next-line
export const LOG = NUMBER_OF_ROLLS === 1 && !isTest()
