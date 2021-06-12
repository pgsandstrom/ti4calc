export function toPercentageNumber(total: number, n: number): number {
  const percentage = n / total
  return Math.round(percentage * 100)
}

export function toPercentageString(total: number, n: number): string {
  return `${toPercentageNumber(total, n)}%`
}
