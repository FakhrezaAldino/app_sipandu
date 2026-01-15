import { app } from './app';
import { config, validateConfig } from './config';

// Validate environment configuration
try {
    validateConfig();
} catch (error) {
    console.error('Configuration Error:', error);
    process.exit(1);
}

// Start server
const server = app.listen(config.server.port, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                 PKH Backend Server                         ║
╠════════════════════════════════════════════════════════════╣
║  Status:      Running                                      ║
║  Port:        ${config.server.port.toString().padEnd(44)}║
║  Environment: ${config.server.nodeEnv.padEnd(44)}║
║  API Base:    http://localhost:${config.server.port}/api                     ║
║  Auth:        http://localhost:${config.server.port}/api/auth                ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const shutdown = () => {
    console.log('\\nShutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('Forced shutdown');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
