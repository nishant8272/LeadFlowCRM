import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import logger from './config/logger';

const startServer = async () => {
  // Connect to Database
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (err: Error) => {
    logger.error(`❌ Unhandled Rejection: ${err.message}`, { stack: err.stack });
    server.close(() => process.exit(1));
  });
};

startServer();
