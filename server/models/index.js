import sequelize from "../config/dbConfig.js";
import User from "./Users.js";
import Leave from "./Leave.js";
import Holiday from "./Holiday.js";

// Define Associations
User.hasMany(Leave, {
  foreignKey: "assignedTo",
  sourceKey: "employeeId",
  as: "leaves",
});

Leave.belongsTo(User, {
  foreignKey: "assignedTo",
  targetKey: "employeeId",
  as: "employee",
});

export { sequelize, User, Leave, Holiday };
export default { sequelize, User, Leave, Holiday };
