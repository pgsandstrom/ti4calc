import { Battle } from '../core/battle-types'
import { SQL, query } from './db'

export interface ErrorReportUnsaved {
  error: true
  message: string
  stack: string
  battle: Battle
}

export interface ErrorReport {
  message: string
  stack: string
  battle: Battle
  created: string
}

export const createErrorReport = async (workerError: ErrorReportUnsaved) => {
  const queryResult = await query(
    SQL`INSERT INTO error_report(error_message, stack, battle) VALUES(
      ${workerError.message},
      ${workerError.stack},
      ${JSON.stringify(workerError.battle)})`,
  )
  return queryResult
}

export const getErrorReports = async (): Promise<ErrorReport[]> => {
  const queryResult = await query(
    SQL`SELECT error_message,stack,battle,created FROM error_report ORDER BY created DESC`,
  )
  return queryResult.rows.map((row) => {
    return {
      /* eslint-disable */
      message: row.error_message,
      stack: row.stack,
      battle: row.battle,
      created: (row.created as Date).toString(),
      /* eslint-enable */
    }
  })
}
