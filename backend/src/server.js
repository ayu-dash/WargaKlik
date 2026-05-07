require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./models');
const waService = require('./services/whatsapp.service');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Sync models
    await sequelize.sync({ alter: true });
    console.log('Database synced');

    // Initialize WhatsApp
    waService.init();
    console.log('WhatsApp service initialized');

    // Initialize cron jobs
    require('./jobs');
    console.log('Cron jobs initialized');

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('⏳ Shutting down gracefully...');
      server.close();
      if (waService.client) {
        try {
          await waService.client.destroy();
          console.log('WhatsApp client destroyed');
        } catch (e) {
          console.error('Error destroying WA client:', e.message);
        }
      }
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
