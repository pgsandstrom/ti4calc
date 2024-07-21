import { query, SQL } from './db'

export interface Usage {
  users: number
  usage_date: string
}

export const registerUsage = async (id: string) => {
  const queryResult = await query(SQL`INSERT INTO usage(id) VALUES(${id}) ON CONFLICT DO NOTHING`)
  return queryResult
}

export const getUsage = async (): Promise<Usage[]> => {
  const queryResult = await query(
    SQL`SELECT count(id) as users, usage_date FROM usage GROUP BY usage_date ORDER BY usage_date`,
  )
  return queryResult.rows.map((row) => {
    return {
      /* eslint-disable */
      users: row.users,
      usage_date: (row.usage_date as Date).toString(),
      /* eslint-enable */
    }
  })
}
