import { LOG } from '../core/constant'

export function logWrapper(...args: Parameters<typeof console.log>) {
  if (LOG) {
    // eslint-disable-next-line no-console
    console.log(args)
  }
}
