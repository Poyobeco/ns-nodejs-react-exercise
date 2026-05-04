import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { Transaction } from '../models/Transaction';
import { Category } from '../models/Category';

export const transactionController = {
  async index(req: Request, res: Response) {
    try {
      const skip = parseInt(req.query.skip as string) || 0;
      const limit = parseInt(req.query.limit as string) || 100;

      const transactions = await Transaction.findAll({
        include: [{ model: Category, as: 'category_rel' }],
        offset: skip,
        limit: limit,
        order: [['id', 'ASC']]
      });

      res.json(transactions.map(t => t.toJSON()));
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
  },

  async grid(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const size = Math.max(1, Math.min(100, parseInt(req.query.size as string) || 10));
      const offset = (page - 1) * size;

      const validSortColumns: Record<string, string> = {
        date: 't.date',
        description: 't.description',
        amount: 't.amount',
        category: 'c.name'
      };
      const sortBy = req.query.sort_by as string;
      const sortExpr = validSortColumns[sortBy] ?? 't.date';
      const sortOrder = req.query.sort_order === 'asc' ? 'ASC' : 'DESC';

      const countRows = await sequelize.query<{ total: string }>(
        'SELECT COUNT(*) AS total FROM transactions',
        { type: QueryTypes.SELECT }
      );
      const total = parseInt(countRows[0].total, 10);

      const items = await sequelize.query(
        `SELECT
           t.id,
           t.date,
           t.description,
           CAST(t.amount AS FLOAT) AS amount,
           t.type,
           t.user_id,
           t.category_id,
           c.name AS category_name,
           (
             SELECT COALESCE(json_agg(json_build_object('id', tg.id, 'name', tg.name)), '[]'::json)
             FROM transaction_tags tt
             JOIN tags tg ON tt.tag_id = tg.id
             WHERE tt.transaction_id = t.id
           ) AS tags
         FROM transactions t
         JOIN categories c ON t.category_id = c.id
         ORDER BY ${sortExpr} ${sortOrder}
         LIMIT :size OFFSET :offset`,
        {
          replacements: { size, offset },
          type: QueryTypes.SELECT
        }
      );

      res.json({ items, total });
    } catch (error) {
      res.status(500).json({ detail: 'Internal server error' });
    }
  }
};
