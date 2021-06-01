//! To avoid isolatedModules error
export default {}

self.addEventListener('message', () => {
  self.postMessage('pong')
})
