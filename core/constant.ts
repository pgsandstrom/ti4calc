import { isTest } from '../util/util-debug'

export const ROLLS_WHEN_BUILDING_TEST_DATA = 100000

// export const NUMBER_OF_ROLLS = 1 as number
export const NUMBER_OF_ROLLS = 20000 as number

export const ROLLS_BETWEEN_UI_UPDATE = 1000

export const LOG = NUMBER_OF_ROLLS === 1 && !isTest()
