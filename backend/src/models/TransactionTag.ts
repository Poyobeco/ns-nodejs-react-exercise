import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class TransactionTag extends Model {}

TransactionTag.init(
  {
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: 'transactions', key: 'id' }
    },
    tag_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: 'tags', key: 'id' }
    }
  },
  {
    sequelize,
    tableName: 'transaction_tags',
    timestamps: false,
    underscored: true
  }
);
