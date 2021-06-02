import crypto from 'crypto'

export default function (s: string) {
  return crypto.createHash('sha256').update(s).digest('hex')
}
