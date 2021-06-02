import { Pool, PoolClient, QueryConfig, QueryResult, types } from 'pg'

// warning: null returning instead of undefined from database might screw us. Can we transform all null to undefined?

// Force count-function in database to return number instead of string
// https://github.com/brianc/node-pg-types#use
types.setTypeParser(20, (val: string) => {
  return parseInt(val, 10)
})

let dbPool: Pool | undefined
const getDbPool = () => {
  if (dbPool === undefined) {
    dbPool = new Pool({
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    })
  }
  return dbPool
}

// Use this for single query
export const query = (stuff: QueryConfig) => getDbPool().query(stuff)
export const queryString = (stuff: string, values?: any[]) => getDbPool().query(stuff, values)

export const querySingle = async <T = any>(stuff: QueryConfig) => {
  const result: QueryResult = await getDbPool().query(stuff)
  return getSingle<T>(result)
}

export const querySingleString = async <T = any>(stuff: string, values?: any[]) => {
  const result: QueryResult = await getDbPool().query(stuff, values)
  return getSingle<T>(result)
}

const getSingle = <T>(result: QueryResult): T | undefined => {
  if (result.rowCount > 1) {
    throw new Error(`Unexpected number of rows: ${result.rowCount}`)
  } else if (result.rowCount === 0) {
    return undefined
  } else {
    return result.rows[0] as T
  }
}

// Use this to gain a client for multiple operations, such as transactions
export const getClient = (): Promise<PoolClient> =>
  new Promise((resolve, reject) => {
    getDbPool().connect((err, client: PoolClient) => {
      // eslint-disable-next-line
      if (err !== undefined) {
        reject(err)
      } else {
        resolve(client)
      }
    })
  })

export const SQL = (parts: TemplateStringsArray, ...values: any[]): QueryConfig => ({
  // eslint-disable-next-line
  text: parts.reduce((prev, curr, i) => prev + '$' + i + curr),
  values,
})
