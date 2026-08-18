import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || "leave_application",
  process.env.MYSQL_USER || "root",
  process.env.MYSQL_PASSWORD || "",
  {
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT) || 3306,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Database connected successfully via Sequelize");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

export default sequelize;
