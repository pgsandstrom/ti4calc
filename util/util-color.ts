import _times from 'lodash/times'
function hexStringToDec(s: string) {
  return parseInt(s, 16)
}

function decToHexColor(s: number) {
  const result = s.toString(16)
  if (result.length === 1) {
    return `0${result}`
  } else {
    return result
  }
}

function breakUpHexColor(h: string): [number, number, number] {
  let r: string | undefined
  let g: string | undefined
  let b: string | undefined

  if (h.length === 4) {
    r = h[1] + h[1]
    g = h[2] + h[2]
    b = h[3] + h[3]
  } else if (h.length === 7) {
    r = h[1] + h[2]
    g = h[3] + h[4]
    b = h[5] + h[6]
  } else {
    throw new Error()
  }

  return [hexStringToDec(r), hexStringToDec(g), hexStringToDec(b)]
}

function getStepsBetweenNumber(start: number, finish: number, steps: number): number[] {
  if (steps === 1) {
    return [start]
  }

  const diff = finish - start
  return _times(steps, (index) => {
    const progress = index / (steps - 1)
    const result = start + diff * progress
    return Math.floor(result)
  })
}

export const getColorProgress = (start: string, finish: string, steps: number) => {
  const startColors = breakUpHexColor(start)
  const finishColors = breakUpHexColor(finish)

  const a = getStepsBetweenNumber(startColors[0], finishColors[0], steps)
  const b = getStepsBetweenNumber(startColors[1], finishColors[1], steps)
  const c = getStepsBetweenNumber(startColors[2], finishColors[2], steps)

  return _times(steps, (index) => {
    return `#${decToHexColor(a[index])}${decToHexColor(b[index])}${decToHexColor(c[index])}`
  })
}
