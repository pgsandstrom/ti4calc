import { useRef } from 'react'

export default function usePrevious<T>(obj: T): T | undefined {
  const ref = useRef<T>(undefined)

  const returnObject = ref.current
  ref.current = obj
  return returnObject
}
