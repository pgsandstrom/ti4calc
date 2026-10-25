import { useRef } from 'react'

/* oxlint-disable react/refs -- reading and writing a ref during render is the point of this hook */

/**
 * @deprecated breaks the rules of react
 */
export default function usePrevious<T>(obj: T): T | undefined {
  const ref = useRef<T>(undefined)

  const returnObject = ref.current
  ref.current = obj
  return returnObject
}
