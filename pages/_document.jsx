import Document, { Html, Head, Main, NextScript } from 'next/document'
// Import styled components ServerStyleSheet
import { ServerStyleSheet } from 'styled-components'

export default class MyDocument extends Document {
  static getInitialProps({ renderPage }) {
    // Step 1: Create an instance of ServerStyleSheet
    const sheet = new ServerStyleSheet()

    // Step 2: Retrieve styles from components in the page
    const page = renderPage((App) => (props) => sheet.collectStyles(<App {...props} />))

    // Step 3: Extract the styles as <style> tags
    const styleTags = sheet.getStyleElement()

    // Step 4: Pass styleTags as a prop
    return { ...page, styleTags }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Step 5: Output the styles in the head  */}
          {this.props.styleTags}

          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
          <meta name="msapplication-TileColor" content="#da532c" />
          <meta name="theme-color" content="#ffffff" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
