import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React from 'react'
import { getUsage, Usage } from '../server/usageController'

interface ErrorProps {
  usage: Usage[]
}

export const getServerSideProps: GetServerSideProps<ErrorProps> = async () => {
  const usage = await getUsage()
  const formattedUsage = usage.map((usage) => {
    return {
      users: usage.users,
      usage_date: usage.usage_date,
    }
  })
  return { props: { usage: formattedUsage } }
}

export default function UsageView(props: ErrorProps) {
  return (
    <div>
      <Head>
        <title>TI4 usage</title>
      </Head>
      <div>
        {props.usage.map((usage) => {
          return (
            <div key={usage.usage_date} style={{ display: 'flex' }}>
              <span style={{ flex: '1 0 0', maxWidth: '700px' }}>{usage.usage_date}</span>
              <span>{usage.users}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
