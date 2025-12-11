import { readFile } from 'fs/promises';
import { join } from 'path';
import { sequelize, connectDatabase } from './src/config/database';
import { Category } from './src/models/Category';
import { Transaction } from './src/models/Transaction';

interface SeedTransaction {
  description: string;
  amount: number;
  type: string;
  category: string;
  user_id: number;
  date: string;
}

async function loadSeedData(): Promise<{ categories: string[], transactions: SeedTransaction[] }> {
  const seedDataPath = join(__dirname, '..', 'data');

  const categoriesData = await readFile(join(seedDataPath, 'categories.json'), 'utf-8');
  const transactionsData = await readFile(join(seedDataPath, 'transactions.json'), 'utf-8');

  return {
    categories: JSON.parse(categoriesData),
    transactions: JSON.parse(transactionsData)
  };
}

async function seed() {
  try {
    await connectDatabase();

    console.log('Clearing existing data...');
    await sequelize.query('TRUNCATE TABLE transactions, categories RESTART IDENTITY CASCADE');

    console.log('Loading seed data from centralized JSON files...');
    const { categories: categoriesData, transactions: transactionsData } = await loadSeedData();

    console.log('Seeding database with initial data...');

    const categories: { [key: string]: Category } = {};
    for (const catName of categoriesData) {
      const category = await Category.create({ name: catName });
      categories[catName] = category;
    }

    for (const data of transactionsData) {
      await Transaction.create({
        description: data.description,
        amount: data.amount,
        type: data.type,
        category_id: categories[data.category].id,
        user_id: data.user_id,
        date: new Date(data.date)
      });
    }

    console.log('Database seeded successfully.');
    console.log(`Seeded ${categoriesData.length} categories and ${transactionsData.length} transactions`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
