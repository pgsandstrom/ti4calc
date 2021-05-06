export const startDebugTimer = (taskName = 'The task') => {
  const timer = {
    startTime: new Date(),

    end: () => {
      const timeMs = new Date().getTime() - timer.startTime.getTime()
      const tmp = Math.floor(timeMs / 100)
      console.log(tmp)
      const seconds = tmp / 10
      if (seconds === 0) {
        console.log(`${taskName} took exactly ${timeMs} milliseconds`)
      } else if (seconds === Math.floor(seconds)) {
        console.log(`${taskName} took ${seconds}.0 seconds`)
      } else {
        console.log(`${taskName} took ${seconds} seconds`)
      }
    },
  }
  return timer
}
