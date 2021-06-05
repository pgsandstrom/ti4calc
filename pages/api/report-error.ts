import { NextApiRequest, NextApiResponse } from 'next'
import { createErrorReport, ErrorReportUnsaved } from '../../server/errorReportController'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const workerError = JSON.parse(req.body) as ErrorReportUnsaved

  await createErrorReport(workerError)

  res.statusCode = 200
  res.json({ status: 'ok' })
}
