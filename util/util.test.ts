//  TODO default allowedErrorPercentage should be based on percentage of total sample
export function checkResult(result: number, expected: number, allowedErrorPercentage = 0.06) {
  expect(result).toBeLessThanOrEqual(expected + expected * allowedErrorPercentage)
  expect(result).toBeGreaterThanOrEqual(expected - expected * allowedErrorPercentage)
  // console.log(`expected ${expected}, got ${result}`)
}

// workaround for the "Your test suite must contain at least one test" error
test.skip('Workaround', () => 1)
