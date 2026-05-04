import { readFile } from 'fs/promises';
import { join } from 'path';
import { sequelize, connectDatabase } from './src/config/database';
import { Category } from './src/models/Category';
import { Tag } from './src/models/Tag';
import { Transaction } from './src/models/Transaction';
import { TransactionTag } from './src/models/TransactionTag';

interface SeedTransaction {
  description: string;
  amount: number;
  type: string;
  category: string;
  user_id: number;
  date: string;
}

const TAG_NAMES = [
  'personal', 'work', 'travel', 'reimbursable',
  'recurring', 'essential', 'entertainment', 'investment'
];

const TRANSACTION_TAGS: Record<string, string[]> = {
  'Groceries':          ['personal', 'essential', 'recurring'],
  'Salary':             ['work', 'recurring'],
  'Rent':               ['personal', 'essential', 'recurring'],
  'Coffee':             ['personal'],
  'Freelance Payment':  ['work'],
  'Books':              ['personal', 'work'],
  'Electricity Bill':   ['essential', 'recurring'],
  'Dinner with Friends':['personal', 'entertainment'],
  'Transportation':     ['travel'],
  'Online Course':      ['work', 'personal'],
  'Shopping':           ['personal'],
  'Gym Membership':     ['personal', 'recurring'],
  'Dividend Income':    ['investment'],
  'Concert Tickets':    ['personal', 'entertainment'],
  'Utility Bill':       ['essential', 'recurring'],
  'Refund':             ['personal'],
  'Lunch':              ['personal', 'work'],
  'Subscription':       ['personal', 'recurring', 'entertainment'],
  'Bonus':              ['work'],
  'Gas':                ['travel', 'essential'],
  'Healthcare':         ['personal', 'essential'],
  'Gift':               ['personal'],
  'Software License':   ['work', 'reimbursable'],
  'Travel Expenses':    ['travel', 'reimbursable', 'work'],
  'Hobby Supplies':     ['personal', 'entertainment']
};

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
    await sequelize.query(
      'TRUNCATE TABLE transaction_tags, transactions, categories, tags RESTART IDENTITY CASCADE'
    );

    console.log('Loading seed data from centralized JSON files...');
    const { categories: categoriesData, transactions: transactionsData } = await loadSeedData();

    console.log('Seeding categories...');
    const categories: Record<string, Category> = {};
    for (const catName of categoriesData) {
      const category = await Category.create({ name: catName });
      categories[catName] = category;
    }

    console.log('Seeding tags...');
    const tags: Record<string, Tag> = {};
    for (const tagName of TAG_NAMES) {
      const tag = await Tag.create({ name: tagName });
      tags[tagName] = tag;
    }

    console.log('Seeding transactions and associations...');
    for (const data of transactionsData) {
      const transaction = await Transaction.create({
        description: data.description,
        amount: data.amount,
        type: data.type,
        category_id: categories[data.category].id,
        user_id: data.user_id,
        date: new Date(data.date)
      });

      const tagNames = TRANSACTION_TAGS[data.description] ?? [];
      for (const tagName of tagNames) {
        await TransactionTag.create({
          transaction_id: transaction.id,
          tag_id: tags[tagName].id
        } as any);
      }
    }

    console.log('Database seeded successfully.');
    console.log(`Seeded ${categoriesData.length} categories, ${TAG_NAMES.length} tags, and ${transactionsData.length} transactions`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
