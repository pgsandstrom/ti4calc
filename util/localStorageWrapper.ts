export const LS_ATTACKER_FACTION = 'attacker.faction'
export const LS_DEFENDER_FACTION = 'defender.faction'
export const LS_SHOW_DETAILED_REPORT = 'show_detailed_report'

export const setLocalStorage = (key: string, value: string) => {
  // eslint-disable-next-line
  if (localStorage) {
    localStorage.setItem(key, value)
  }
}

export const getLocalStorage = (key: string) => {
  // eslint-disable-next-line
  if (localStorage) {
    const value = localStorage.getItem(key)
    if (value == null) {
      return undefined
    } else {
      return value
    }
  } else {
    return undefined
  }
}
