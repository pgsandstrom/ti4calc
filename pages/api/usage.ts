import { isArray } from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'
import sha256 from '../../server/sha256'
import { registerUsage } from '../../server/usageController'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let ip = req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? undefined
  console.log(`ip: ${ip}`)
  if (isArray(ip)) {
    ip = ip[0]
  }
  if (ip == null) {
    return
  }

  const hash = sha256(ip)
  await registerUsage(hash)

  res.statusCode = 200
  res.json({ status: 'ok' })
}
