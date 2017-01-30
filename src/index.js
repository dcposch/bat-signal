/* global self */
if (self.Window && (self instanceof self.Window)) {
  require('./app')
} else {
  require('./service-worker')
}
