import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface TagAttributes {
  id: number;
  name: string;
}

interface TagCreationAttributes extends Optional<TagAttributes, 'id'> {}

export class Tag extends Model<TagAttributes, TagCreationAttributes> implements TagAttributes {
  declare id: number;
  declare name: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Tag.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    }
  },
  {
    sequelize,
    tableName: 'tags',
    timestamps: true,
    underscored: true
  }
);
