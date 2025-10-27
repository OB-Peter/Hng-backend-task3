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

// ✅ Built-in middleware
app.use(express.json()); // For parsing JSON requests

// ✅ Routes
app.use("/countries", countryRoutes);

// ✅ Root route
app.get("/", (req, res) => {
  res.send("🌍 Country API is running");
});

// ✅ Global error handler (optional but helpful)
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Database connected and synced successfully!");
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error("❌ Database sync failed:", err.message);
  }
});
