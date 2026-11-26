const bcrypt = require('bcryptjs');
const { connectDb, disconnectDb } = require('../src/config/db');
const env = require('../src/config/env');
const { User, Project, Issue, Comment, Label, RevokedToken } = require('../src/models');

const PASSWORD = 'Password123';

async function seed() {
  if (env.nodeEnv === 'production') throw new Error('Refusing to seed a production database');
  await connectDb();
  await Promise.all([User, Project, Issue, Comment, Label, RevokedToken].map((m) => m.deleteMany({})));
  const passwordHash = await bcrypt.hash(PASSWORD, env.bcryptRounds);

  const [nanbon, adonai, leila, sanjay, matteo, giuseppe, luca, leo] = await User.create([
    { name: 'Nanbon Admin', email: 'nanbon@example.com', role: 'admin', passwordHash },
    { name: 'Adonai Manager', email: 'adonai@example.com', role: 'project_manager', passwordHash },
    { name: 'Leila Manager', email: 'leila@example.com', role: 'project_manager', passwordHash },
    { name: 'Sanjay Member', email: 'sanjay@example.com', role: 'member', passwordHash },
    { name: 'Matteo Member', email: 'matteo@example.com', role: 'member', passwordHash },
    { name: 'Giuseppe Member', email: 'giuseppe@example.com', role: 'member', passwordHash },
    { name: 'Luca Member', email: 'luca@example.com', role: 'member', passwordHash },
    { name: 'Leo Member', email: 'leo@example.com', role: 'member', passwordHash },
  ]);

  const web = await Project.create({
    name: 'Website Redesign', key: 'WEB', description: 'Relaunch of the company website',
    owner: adonai._id, members: [adonai._id, sanjay._id, matteo._id, luca._id],
  });
  const mobile = await Project.create({
    name: 'Mobile App', key: 'MOB', description: 'iOS and Android client',
    owner: leila._id, members: [leila._id, matteo._id, giuseppe._id, leo._id],
  });

  const [bug, feature, ui, mobileBug] = await Label.create([
    { name: 'bug', color: '#d73a4a', project: web._id },
    { name: 'feature', color: '#0e8a16', project: web._id },
    { name: 'ui', color: '#1d76db', project: web._id },
    { name: 'bug', color: '#d73a4a', project: mobile._id }, // same name, different project
  ]);

  const issues = await Issue.create([
    { title: 'Login button misaligned on Safari', description: 'The login button overlaps the footer.', status: 'open', priority: 'medium', project: web._id, reporter: sanjay._id, assignee: matteo._id, labels: [bug._id, ui._id] },
    { title: 'Add dark mode', description: 'Users asked for a dark theme.', status: 'in_progress', priority: 'low', project: web._id, reporter: matteo._id, assignee: sanjay._id, labels: [feature._id, ui._id] },
    { title: 'Contact form returns 500', description: 'Submitting the form with a long message crashes the API.', status: 'open', priority: 'critical', project: web._id, reporter: sanjay._id, assignee: null, labels: [bug._id] },
    { title: 'Update privacy policy page', description: 'Legal sent new text.', status: 'resolved', priority: 'high', project: web._id, reporter: adonai._id, assignee: luca._id, labels: [] },
    { title: 'Old landing page cleanup', description: 'Remove the unused landing page.', status: 'closed', priority: 'low', project: web._id, reporter: matteo._id, assignee: matteo._id, labels: [] },
    { title: 'App crashes on startup (Android 12)', description: 'NullPointerException in MainActivity.', status: 'open', priority: 'critical', project: mobile._id, reporter: giuseppe._id, assignee: matteo._id, labels: [mobileBug._id] },
    { title: 'Push notifications arrive twice', description: 'Duplicate notifications on iOS.', status: 'in_progress', priority: 'high', project: mobile._id, reporter: leo._id, assignee: giuseppe._id, labels: [mobileBug._id] },
    { title: 'Add biometric login', description: 'Face ID and fingerprint support.', status: 'open', priority: 'medium', project: mobile._id, reporter: leila._id, assignee: null, labels: [],
      attachments: [{ filename: 'wireframe.png', url: 'https://example.com/files/wireframe.png', mimeType: 'image/png', size: 48211 }] },
  ]);

  await Comment.create([
    { issue: issues[0]._id, author: matteo._id, body: 'I can reproduce this on Safari 17.' },
    { issue: issues[0]._id, author: adonai._id, body: 'Assigned to Matteo, please fix before the release.' },
    { issue: issues[2]._id, author: sanjay._id, body: 'Happens with messages over 5000 characters.' },
    { issue: issues[5]._id, author: leila._id, body: 'Top priority for the next sprint.' },
  ]);

  console.log('Seed complete.');
  console.log(`Accounts (password for all: ${PASSWORD}):`);
  console.log('  nanbon@example.com   (admin)');
  console.log('  adonai@example.com   (project_manager, owns WEB)');
  console.log('  leila@example.com    (project_manager, owns MOB)');
  console.log('  sanjay, matteo, luca @example.com (members of WEB; matteo is also in MOB)');
  console.log('  giuseppe, leo @example.com (members of MOB)');
  await disconnectDb();
  void nanbon;
}

seed().catch((e) => { console.error(e.message); process.exit(1); });
