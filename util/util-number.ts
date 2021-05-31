export function toPercentage(total: number, n: number): string {
  const percentage = n / total
  const tmp = Math.round(percentage * 100)
  return `${tmp}%`
}
