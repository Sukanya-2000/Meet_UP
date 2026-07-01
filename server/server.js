import 'dotenv/config';
import http from 'http';
import app from './app.js';
import connectDatabase from './config/database.js';
import { initializeSocket } from './socket/index.js';
import { validateEnvironment } from './config/environment.js';
import { logger } from './services/observability.service.js';

const port = process.env.PORT || 5000;

const startServer = async () => {
  validateEnvironment();
  await connectDatabase();
  const server = http.createServer(app);
  const io = initializeSocket(server);
  app.set('io', io);
  server.listen(port, () => logger.info('server_started',{port}));
  const shutdown=(signal)=>{logger.info('graceful_shutdown',{signal});server.close(async()=>{await (await import('mongoose')).default.disconnect();process.exit(0)});setTimeout(()=>process.exit(1),10000).unref()};process.once('SIGTERM',()=>shutdown('SIGTERM'));process.once('SIGINT',()=>shutdown('SIGINT'));
};

startServer().catch((error) => {
  console.error(`Unable to start server: ${error.message}`);
  process.exit(1);
});
