export default function getServerUrl() {
  const port = location.port ? `:${location.port}` : ''
  return `${window.location.protocol}//${window.location.hostname}${port}`
}
