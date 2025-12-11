import { sequelize, connectDatabase } from './src/config/database';
import './src/models/Category';
import './src/models/Transaction';

async function init() {
  try {
    await connectDatabase();

    console.log('Creating database tables...');
    await sequelize.sync({ force: true });
    console.log('Tables created.');

    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

init();
