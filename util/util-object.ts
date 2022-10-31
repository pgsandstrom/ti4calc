import { PartialRecord } from './util-types'

/**
 * Object.keys but keeps type safety
 */
export function objectKeys<T extends object>(obj: T): Array<keyof T> {
  const entries = Object.keys(obj)
  return entries as Array<keyof T>
}

/**
 * Object.entries but keeps type safety
 */
export function objectEntries<K extends string | number | symbol, V>(
  obj: PartialRecord<K, V>,
): Array<[K, V]> {
  const entries = Object.entries(obj)
  return entries as Array<[K, V]>
}
