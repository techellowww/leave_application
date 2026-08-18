import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const dbName = process.env.MYSQL_DATABASE || "leave_application";
const dbUser = process.env.MYSQL_USER || "root";
const dbPassword = process.env.MYSQL_PASSWORD || "";
const dbHost = process.env.MYSQL_HOST || "127.0.0.1";
const dbPort = Number(process.env.MYSQL_PORT) || 3308;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: "mysql",
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const connectDB = async () => {
  try {
    // Ensure the database exists before connecting with Sequelize
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();

    await sequelize.authenticate();
    console.log("✅ MySQL Database connected successfully via Sequelize");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

export default sequelize;

