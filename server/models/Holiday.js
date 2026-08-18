import { DataTypes } from "sequelize";
import sequelize from "../config/dbConfig.js";

const Holiday = sequelize.define(
  "Holiday",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("holiday", "non-working"),
      allowNull: false,
      defaultValue: "holiday",
    },
  },
  {
    tableName: "holidays",
    timestamps: true,
    indexes: [
      { fields: ["date"] },
    ],
  }
);

Holiday.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

export default Holiday;
