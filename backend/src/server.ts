// Must be the first import: loads dotenv and validates required env vars.
// Any module imported below can safely read from `env` synchronously.
import { env } from './config/env';

import http from 'http';
import app from './app';
import connectDB from './config/db';
import { initSocket } from './services/socket.service';
import { seedSuperAdmin } from './config/seed';

const start = async (): Promise<void> => {
  await connectDB();
  await seedSuperAdmin();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

start();
