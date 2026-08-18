import { DataTypes } from "sequelize";
import sequelize from "../config/dbConfig.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobileNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIndianMobile(value) {
          if (!/^(?:\+91[\-\s]?|0)?[6-9]\d{9}$/.test(value)) {
            throw new Error(
              "Please enter a valid 10-digit Indian mobile number",
            );
          }
        },
      },
    },
    role: {
      type: DataTypes.ENUM("admin", "user"),
      allowNull: false,
      defaultValue: "user",
    },
    employeeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    joiningDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    allotedLeaves: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 24,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["email"] },
      { unique: true, fields: ["employeeId"] },
    ],
  },
);

// Instance method to compare password
User.prototype.matchPassword = async function (enteredPassword) {
  if (!this.password || !enteredPassword) return false;
  return this.password === enteredPassword;
};

// Custom serialization to include _id and password
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

export default User;
