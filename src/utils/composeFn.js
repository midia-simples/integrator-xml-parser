const compose = (...fns) => value =>
  fns.reduceRight((previousValue, fn) =>
    fn(previousValue), value)

module.exports = compose
