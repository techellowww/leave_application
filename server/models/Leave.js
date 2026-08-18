import { DataTypes } from "sequelize";
import sequelize from "../config/dbConfig.js";

const Leave = sequelize.define(
  "Leave",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fromDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    toDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    totalDays: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      get() {
        const rawVal = this.getDataValue("totalDays");
        return rawVal ? parseFloat(rawVal) : 0;
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    employeeId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assignedTo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    leaveType: {
      type: DataTypes.ENUM("Casual", "Sick"),
      allowNull: false,
    },
    rejectedReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "leaves",
    timestamps: true,
    indexes: [
      { fields: ["assignedTo"] },
      { fields: ["employeeId"] },
      { fields: ["status"] },
      { fields: ["fromDate"] },
      { fields: ["toDate"] },
    ],
  }
);

Leave.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

export default Leave;
