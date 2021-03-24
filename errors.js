class ScanError extends Error {
  constructor(message, ...extras) {

    super()

    Error.captureStackTrace(this, this.constructor)
    this.name = 'ScanError'
    this.message = message
    if (extras) {
      this.extras = extras
    }

  }
}

module.exports = {
  ScanError,
}