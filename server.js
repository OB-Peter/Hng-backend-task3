import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import countryRoutes from "./routes/countryRoutes.js";
import dns from "dns";

// Force IPv4 and set Google + Cloudflare DNS
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use("/countries", countryRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.send("Country API is running");
});


app.listen(PORT, async () => {
  try {
    await sequelize.sync({ alter: true });++
    console.log("✅ Database connected and synced successfully!");
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error("❌ Database sync failed:", err.message);
  }
});
