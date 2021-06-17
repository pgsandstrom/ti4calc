import { isArray } from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'
import sha256 from '../../server/sha256'
import { registerUsage } from '../../server/usageController'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('headers')
  console.log(req.headers)
  console.log(`req.headers['x-forwarded-for']: ${req.headers['x-forwarded-for']}`)
  console.log(`req.headers['x-real-ip']: ${req.headers['x-real-ip']}`)
  console.log(`req.socket.remoteAddress: ${req.socket.remoteAddress}`)
  console.log(`req.socket.remoteFamily: ${req.socket.remoteFamily}`)
  console.log(`req.socket.localAddress: ${req.socket.localAddress}`)
  console.log(`req.connection.remoteAddress: ${req.connection.remoteAddress}`)
  let ip = req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? undefined
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
