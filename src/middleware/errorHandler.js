const AppError = require('../utils/AppError');

function notFoundHandler(req, res, next) {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message;
  let details = err.details;

  if (err.name === 'ValidationError' && err.errors) { 
    status = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'CastError') { 
    status = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err.code === 11000) { 
    status = 409;
    message = `Duplicate value for: ${Object.keys(err.keyValue || {}).join(', ')}`;
  } else if (err.type === 'entity.parse.failed') { 
    status = 400;
    message = 'Malformed JSON body';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body too large';
  } else if (!err.isOperational) {
    status = 500;
    message = 'Internal server error';
    if (process.env.NODE_ENV !== 'test') console.error(err);
  }

  const body = { status: 'error', message };
  if (details) body.details = details;
  res.status(status).json(body);
}

module.exports = { notFoundHandler, errorHandler };