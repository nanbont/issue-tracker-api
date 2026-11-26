// this is a wrapper, function return function
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);