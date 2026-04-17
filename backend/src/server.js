const app = require('./app');
const env = require('./config/env');
const connectDatabase = require('./config/db');

async function startServer() {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`Backend server running on http://localhost:${env.port}`);
  });
}

startServer();
