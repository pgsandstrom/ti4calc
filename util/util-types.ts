export enum StorageType {
  Local = 'LOCAL',
  Session = 'SESSION',
}

export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T
}

export interface FullMap<K, V> extends Map<K, V> {
  get(key: K): V
}
