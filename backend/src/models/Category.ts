import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface CategoryAttributes {
  id: number;
  name: string;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id'> {}

export class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  declare id: number;
  declare name: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'categories',
    timestamps: true,
    underscored: true
  }
);
