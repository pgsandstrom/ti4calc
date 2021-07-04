export const LS_ATTACKER_RACE = 'attacker.race'
export const LS_DEFENDER_RACE = 'defender.race'
export const LS_SHOW_DETAILED_REPORT = 'show_detailed_report'

export const setLocalStorage = (key: string, value: string) => {
  // eslint-disable-next-line
  if (localStorage) {
    localStorage.setItem(key, value)
  }
}

export const getLocalStorage = <T extends string | symbol>(key: string) => {
  // eslint-disable-next-line
  if (localStorage) {
    const value = localStorage.getItem(key) as T | null
    if (value == null) {
      return undefined
    } else {
      return value
    }
  } else {
    return undefined
  }
}
