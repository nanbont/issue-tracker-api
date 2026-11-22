const express = require('express');
const morgan = require('morgan');

function createApp() {
  const app = express();

  app.use(express.json({ limit: '100kb' }));
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

  return app;
}

module.exports = createApp;