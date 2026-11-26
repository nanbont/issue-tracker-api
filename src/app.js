const express = require('express');
const morgan = require('morgan');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
function createApp() {
  const app = express();

  app.use(express.json({ limit: '100kb' }));
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));


  app.use(notFoundHandler);
  app.use(errorHandler);
  
  return app;
}

module.exports = createApp;