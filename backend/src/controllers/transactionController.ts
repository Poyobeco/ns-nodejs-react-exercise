import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';
import { Category } from '../models/Category';

export const transactionController = {
  async index(req: Request, res: Response) {
    try {
      const skip = parseInt(req.query.skip as string) || 0;
      const limit = parseInt(req.query.limit as string) || 100;

      const transactions = await Transaction.findAll({
        offset: skip,
        limit: limit,
        order: [['id', 'ASC']]
      });

      const transactionsWithCategory = await Promise.all(
        transactions.map(async (transaction) => {
          const category = await Category.findByPk(transaction.category_id);
          const data = transaction.toJSON();
          data.category_rel = category ? { id: category.id, name: category.name } : undefined;
          return data;
        })
      );

      res.json(transactionsWithCategory);
    } catch (error) {
      res.status(500).json({ detail: 'Internal server error' });
    }
  },

  async show(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      const transaction = await Transaction.findByPk(id, {
        include: [{ model: Category, as: 'category_rel' }]
      });

      if (!transaction) {
        return res.status(404).json({ detail: 'Transaction not found' });
      }

      res.json(transaction.toJSON());
    } catch (error) {
      res.status(500).json({ detail: 'Internal server error' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { description, amount, type, category_id, user_id, date } = req.body;

      if (!description || amount === undefined || !type || !category_id || !user_id) {
        return res.status(422).json({ detail: 'Missing required fields' });
      }

      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(422).json({ detail: 'Category not found' });
      }

      const transaction = await Transaction.create({
        description,
        amount: parseFloat(amount),
        type,
        category_id,
        user_id,
        date: date ? new Date(date) : new Date()
      });

      const createdTransaction = await Transaction.findByPk(transaction.id, {
        include: [{ model: Category, as: 'category_rel' }]
      });

      res.json(createdTransaction!.toJSON());
    } catch (error) {
      res.status(500).json({ detail: 'Internal server error' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { description, amount, type, category_id, user_id } = req.body;

      const transaction = await Transaction.findByPk(id);

      if (!transaction) {
        return res.status(404).json({ detail: 'Transaction not found' });
      }

      if (description !== undefined) transaction.description = description;
      if (amount !== undefined) transaction.amount = parseFloat(amount);
      if (type !== undefined) transaction.type = type;
      if (category_id !== undefined) {
        const category = await Category.findByPk(category_id);
        if (category) {
          transaction.category_id = category_id;
        }
      }
      if (user_id !== undefined) transaction.user_id = user_id;

      await transaction.save();

      const updatedTransaction = await Transaction.findByPk(id, {
        include: [{ model: Category, as: 'category_rel' }]
      });

      res.json(updatedTransaction!.toJSON());
    } catch (error) {
      res.status(500).json({ detail: 'Internal server error' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      const transaction = await Transaction.findByPk(id, {
        include: [{ model: Category, as: 'category_rel' }]
      });

      if (!transaction) {
        return res.status(404).json({ detail: 'Transaction not found' });
      }

      const data = transaction.toJSON();
      await transaction.destroy();

      res.json(data);
    } catch (error) {
      res.status(500).json({ detail: 'Internal server error' });
    }
  }
};
