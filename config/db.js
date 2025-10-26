import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config(); // load environment variables

// Create a Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // set to true to see SQL logs
  }
);

// Test the connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully!");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
  }
})();

export default sequelize