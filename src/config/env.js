require('dotenv').config({ quiet: true });

const required = ['JWT_SECRET'];

function load() {
  const isTest = process.env.NODE_ENV === 'test';
  const env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    mongoUri: isTest
      ? process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/issue_tracker_test'
      : process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/issue_tracker',
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  };
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable ${key}. Copy .env.example to .env first.`);
    }
  }
  return env;
}

module.exports = load();