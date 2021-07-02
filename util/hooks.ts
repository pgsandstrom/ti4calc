import throttle from 'lodash/throttle'
import { useLayoutEffect } from 'react'

const withThrottle = (fn: (...args: any[]) => void, throttleTime?: number) =>
  throttleTime !== undefined ? throttle(fn, throttleTime) : fn

export function useResize(onResize: () => void, { throttleTime }: { throttleTime?: number } = {}) {
  useLayoutEffect(() => {
    onResize()
    const listener = withThrottle(onResize, throttleTime)
    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  }, [onResize, throttleTime])
}
