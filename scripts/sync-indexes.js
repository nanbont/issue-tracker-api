
const { connectDb, disconnectDb } = require('../src/config/db');
const models = require('../src/models');

(async () => {
  await connectDb();
  for (const name of ['User', 'Project', 'Issue', 'Comment', 'Label', 'RevokedToken']) {
    await models[name].createCollection().catch(() => {});
    await models[name].syncIndexes();
    console.log(`✔ ${name}: collection and indexes ready`);
  }
  await disconnectDb();
})().catch((e) => { console.error(e); process.exit(1); });