const env = require('./config/env');
const { connectDb } = require('./config/db');
const createApp = require('./app');

async function main() {
  await connectDb();   
  console.log(`MongoDB connected: ${env.mongoUri.replace(/\/\/.*@/, '//***@')}`);


  const app = createApp();
  app.listen(env.port, () => console.log(`API listening on http://localhost:${env.port}`));
}

main().catch((err) => {
  console.error('Failed to start application:', err.message);
  process.exit(1);
});