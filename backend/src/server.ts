import config from '@config/Config';
import app, { App } from '@app';
import pino from '@util/Pino';

let server;

(async () => {
  await app.configure();

  // Start HTTP server
  server = app.express.listen(app.express.get('port'), function () {
    showMode();
    pino.info(`🚀 Webhook Catcher HTTP Server running on port ${app.express.get('port')}`);
  });

  // Setup graceful shutdown
  setupGracefulShutdown();
})();

function showMode() {
  if (config.nodeEnv === 'dev') {
    pino.info(`Server starting in developer mode!`);
  }
  if (config.nodeEnv === 'production') {
    pino.info(`Server starting in production mode!`);
  }
}

function setupGracefulShutdown() {
  // Capture termination signals for graceful shutdown
  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  
  signals.forEach(signal => {
    process.on(signal, async () => {
      pino.info(`Signal ${signal} received. Starting graceful shutdown...`);
      
      try {
        // Close HTTP server to stop accepting new requests
        if (server) {
          pino.info('Closing HTTP server...');
          await new Promise(resolve => server.close(resolve));
          pino.info('HTTP server closed.');
        }
        
        // Disconnect database
        pino.info('Disconnecting database...');
        await App.instance.shutdown();
        pino.info('Database disconnected successfully.');
        
        pino.info('Graceful shutdown completed.');
        process.exit(0);
      } catch (error) {
        pino.error(`Error during graceful shutdown: ${error.message}`);
        process.exit(1);
      }
    });
  });
  
  // Capture unhandled exceptions
  process.on('uncaughtException', async (error) => {
    pino.error(`Uncaught exception: ${error.message}`);
    pino.error(error.stack);
    
    try {
      // Even in case of error, try graceful shutdown
      await App.instance.shutdown();
    } catch (shutdownError) {
      pino.error(`Error disconnecting database during exception: ${shutdownError.message}`);
    }
    
    process.exit(1);
  });

  // Capture unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    pino.error(`Unhandled rejection at: ${promise}, reason: ${reason}`);
    
    try {
      await App.instance.shutdown();
    } catch (shutdownError) {
      pino.error(`Error disconnecting database during rejection: ${shutdownError.message}`);
    }
    
    process.exit(1);
  });
}
