import { DataTypes, Model, Optional, Association } from 'sequelize';
import { sequelize } from '../config/database';
import { Category } from './Category';

interface TransactionAttributes {
  id: number;
  description: string;
  amount: number;
  type: string;
  category_id: number;
  user_id: number;
  date: Date;
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id' | 'date'> {}

export class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  declare id: number;
  declare description: string;
  declare amount: number;
  declare type: string;
  declare category_id: number;
  declare user_id: number;
  declare date: Date;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare category_rel?: Category;

  declare static associations: {
    category_rel: Association<Transaction, Category>;
  };

  toJSON() {
    const values = super.toJSON() as TransactionAttributes & {
      category_rel?: { id: number; name: string };
    };
    return {
      id: values.id,
      description: values.description,
      amount: typeof values.amount === 'string' ? parseFloat(values.amount) : values.amount,
      type: values.type,
      category_id: values.category_id,
      user_id: values.user_id,
      date: values.date,
      category_rel: values.category_rel ? {
        id: values.category_rel.id,
        name: values.category_rel.name
      } : undefined
    };
  }
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'transactions',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['date'] },
      { fields: ['category_id'] }
    ]
  }
);

Transaction.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category_rel'
});

Category.hasMany(Transaction, {
  foreignKey: 'category_id',
  as: 'transactions'
});
