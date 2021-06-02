import { query, SQL } from './db'

export const registerUsage = async (id: string) => {
  const queryResult = await query(SQL`INSERT INTO usage(id) VALUES(${id}) ON CONFLICT DO NOTHING`)
  return queryResult
}
