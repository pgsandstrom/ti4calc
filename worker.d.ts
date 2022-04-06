declare module 'worker-loader?filename=static/[chunkhash].worker.js!*' {
  class WebpackWorker extends Worker {
    constructor()
  }

  export default WebpackWorker
}
