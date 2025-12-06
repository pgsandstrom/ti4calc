import { GetServerSideProps } from 'next'
import Head from 'next/head'

import { ErrorReport, getErrorReports } from '../server/errorReportController'

interface ErrorProps {
  workerErrorList: ErrorReport[]
}

export const getServerSideProps: GetServerSideProps<ErrorProps> = async () => {
  const workerErrorList = await getErrorReports()
  return { props: { workerErrorList } }
}

export default function ErrorView(props: ErrorProps) {
  return (
    <div style={{ color: 'white' }}>
      <Head>
        <title>TI4 Errors</title>
      </Head>
      <div>Yeah, this page looks like crap, but who cares?</div>
      <div>errors:</div>
      <div>
        {props.workerErrorList.map((error, index) => {
          return (
            <div key={index} style={{ display: 'flex', marginTop: '20px' }}>
              <div style={{ flex: '0 0 auto' }}>{error.message}</div>
              <div style={{ flex: '1 0 0', marginLeft: '10px' }}>{error.stack}</div>
              <div style={{ flex: '1 0 0', marginLeft: '10px' }}>
                {JSON.stringify(error.battle)}
              </div>
              <div style={{ flex: '0 0 auto' }}>{error.created}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
