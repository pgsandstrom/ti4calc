import { Pool, PoolClient, QueryConfig, QueryResult, QueryResultRow, types } from 'pg'

// warning: null returning instead of undefined from database might screw us. Can we transform all null to undefined?

// Force count-function in database to return number instead of string
// https://github.com/brianc/node-pg-types#use
types.setTypeParser(20, (val: string) => {
  return parseInt(val, 10)
})

let dbPool: Pool | undefined

const getDbPool = () => {
  if (dbPool === undefined) {
    const dev = process.env.NODE_ENV !== 'production'
    if (dev) {
      dbPool = new Pool({
        host: 'localhost',
        database: 'ti4calc',
        user: 'postgres',
        password: 'postgres',
      })
    } else {
      dbPool = new Pool({
        host: 'db',
        database: 'ti4calc',
        user: 'postgres',
        password: 'postgres',
      })
    }
  }
  return dbPool
}

// Use this for single query
export const query = <T extends QueryResultRow = any>(stuff: QueryConfig) =>
  getDbPool().query<T>(stuff)
export const queryString = <T extends QueryResultRow = any>(stuff: string, values?: any[]) =>
  getDbPool().query<T>(stuff, values)

export const querySingle = async <T extends QueryResultRow = any>(stuff: QueryConfig) => {
  const result: QueryResult<T> = await getDbPool().query<T>(stuff)
  return getSingle<T>(result)
}

export const querySingleString = async <T extends QueryResultRow = any>(
  stuff: string,
  values?: any[],
) => {
  const result: QueryResult<T> = await getDbPool().query<T>(stuff, values)
  return getSingle<T>(result)
}

const getSingle = <T extends QueryResultRow>(result: QueryResult<T>): T | undefined => {
  if (result.rowCount === null || result.rowCount > 1) {
    throw new Error(`Unexpected number of rows: ${result.rowCount}`)
  } else if (result.rowCount === 0) {
    return undefined
  } else {
    return result.rows[0]
  }
}

// Use this to gain a client for multiple operations, such as transactions
export const getClient = (): Promise<PoolClient> => {
  return getDbPool().connect()
}

export const SQL = (parts: TemplateStringsArray, ...values: any[]): QueryConfig => ({
  text: parts.reduce((prev, curr, i) => prev + '$' + i + curr),
  values,
})
