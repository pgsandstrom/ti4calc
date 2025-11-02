import { useRef } from 'react'

/**
 * @deprecated breaks the rules of react
 */
export default function usePrevious<T>(obj: T): T | undefined {
  const ref = useRef<T>(undefined)

  // eslint-disable-next-line react-hooks/refs
  const returnObject = ref.current
  // eslint-disable-next-line react-hooks/refs
  ref.current = obj
  return returnObject
}
