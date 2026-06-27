import 'dotenv/config';
import http from 'http';
import app from './app.js';
import connectDatabase from './config/database.js';
import { initializeSocket } from './socket/index.js';

const port = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();
  const server = http.createServer(app);
  const io = initializeSocket(server);
  app.set('io', io);
  server.listen(port, () => console.log(`CyberNest API and Socket.IO running on port ${port}`));
};

startServer().catch((error) => {
  console.error(`Unable to start server: ${error.message}`);
  process.exit(1);
});
