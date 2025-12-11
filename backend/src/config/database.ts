import { Sequelize } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://fintech_user:fintech_password@db:5432/fintech_db';

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
}
