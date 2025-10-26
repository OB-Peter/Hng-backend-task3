import axios from "axios";
import Country from "../models/Country.js";
import sequelize from "../config/db.js";
import fs from "fs";
import path from "path";
import { createCanvas } from "canvas"; // ✅ for generating summary image

// ===================================================
// ✅ Utility: generate and save summary image
// ===================================================
export const generateCountriesImage = async (countries) => {
  if (!fs.existsSync("cache")) fs.mkdirSync("cache");
  const filePath = path.join("cache", "summary.png");

  if (!Array.isArray(countries) || countries.length === 0) return null;

  // Top 5 by estimated GDP
  const top5 = [...countries]
    .filter(c => c.estimated_gdp)
    .sort((a, b) => b.estimated_gdp - a.estimated_gdp)
    .slice(0, 5);

  const lastRefreshed = new Date(
    Math.max(...countries.map(c => new Date(c.last_refreshed_at || 0)))
  ).toLocaleString();

  // Canvas setup
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = "#00ffcc";
  ctx.font = "bold 28px Sans";
  ctx.fillText("🌍 Global Country Summary", 220, 60);

  // Total count
  ctx.fillStyle = "#ffffff";
  ctx.font = "20px Sans";
  ctx.fillText(`Total Countries: ${countries.length}`, 60, 120);

  // Top 5 GDP
  ctx.fillText("Top 5 by Estimated GDP:", 60, 170);
  ctx.font = "18px Sans";
  top5.forEach((c, i) => {
    ctx.fillText(`${i + 1}. ${c.name} - $${c.estimated_gdp.toLocaleString()}`, 80, 210 + i * 40);
  });

  // Timestamp
  ctx.font = "16px Sans";
  ctx.fillStyle = "#aaa";
  ctx.fillText(`Last Refresh: ${lastRefreshed}`, 60, 480);

  // Save image
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(filePath, buffer);

  return filePath;
};

// ===================================================
// ✅ POST /countries/refresh
// ===================================================
export const refreshCountries = async (req, res) => {
  try {
    console.log("🌍 Fetching countries and exchange rates...");

    const [countryResponse, rateResponse] = await Promise.all([
      axios.get("https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies"),
      axios.get("https://open.er-api.com/v6/latest/USD"),
    ]);

    const countries = countryResponse.data;
    const rates = rateResponse.data?.rates;

    if (!countries || !rates) {
      return res.status(503).json({
        error: "External data source unavailable",
        details: "Could not fetch data from restcountries or exchange rate API",
      });
    }

    const refreshTime = new Date();
    let processedCount = 0;

    for (const c of countries) {
      const name = c.name || "N/A";
      const capital = c.capital || "N/A";
      const region = c.region || "N/A";
      const population = c.population || 0;
      const flag_url = c.flag || null;

      let currency_code = null;
      let exchange_rate = null;
      let estimated_gdp = null;

      if (c.currencies && Array.isArray(c.currencies) && c.currencies.length > 0) {
        const currency = c.currencies[0];
        currency_code = currency.code || null;
      }

      if (currency_code && rates[currency_code]) {
        exchange_rate = rates[currency_code];
        const randomMultiplier = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
        estimated_gdp = population > 0
          ? (population * randomMultiplier) / exchange_rate
          : 0;
      }

      const existing = await Country.findOne({
        where: sequelize.where(
          sequelize.fn("lower", sequelize.col("name")),
          name.toLowerCase()
        ),
      });

      if (existing) {
        await existing.update({
          capital,
          region,
          population,
          currency_code,
          exchange_rate,
          estimated_gdp,
          flag_url,
          last_refreshed_at: refreshTime,
        });
      } else {
        await Country.create({
          name,
          capital,
          region,
          population,
          currency_code,
          exchange_rate,
          estimated_gdp,
          flag_url,
          last_refreshed_at: refreshTime,
        });
      }

      processedCount++;
    }

    // Generate summary image (just save it)
    const allCountries = await Country.findAll({ raw: true });
    await generateCountriesImage(allCountries);

    return res.status(200).json({
      message: "✅ Countries refreshed and summary image generated successfully!",
      total_countries: processedCount,
      refreshed_at: refreshTime,
    });

  } catch (error) {
    console.error("❌ Error in refreshCountries:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

// ===================================================
// ✅ GET /countries (filters & sorting)
// ===================================================
export const getCountries = async (req, res) => {
  try {
    const { region, currency, sort } = req.query;
    const where = {};
    if (region) where.region = region;
    if (currency) where.currency_code = currency;

    const order = [];
    if (sort) {
      const [field, direction] = sort.split("_");
      order.push([field, direction?.toUpperCase() || "ASC"]);
    }

    const countries = await Country.findAll({ where, order });
    res.status(200).json({ count: countries.length, data: countries });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===================================================
// ✅ GET /countries/:name
// ===================================================
export const getCountryByName = async (req, res) => {
  try {
    const country = await Country.findOne({
      where: sequelize.where(
        sequelize.fn("lower", sequelize.col("name")),
        req.params.name.toLowerCase()
      ),
    });
    if (!country) return res.status(404).json({ message: "Country not found" });
    res.json(country);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===================================================
// ✅ DELETE /countries/:name
// ===================================================
export const deleteCountry = async (req, res) => {
  try {
    const deleted = await Country.destroy({
      where: sequelize.where(
        sequelize.fn("lower", sequelize.col("name")),
        req.params.name.toLowerCase()
      ),
    });
    if (!deleted) return res.status(404).json({ message: "Country not found" });
    res.json({ message: "Country deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===================================================
// ✅ GET /status → total countries & last refresh
// ===================================================
export const getStatus = async (req, res) => {
  try {
    const total = await Country.count();
    const latest = await Country.max("last_refreshed_at");

    res.json({
      total_countries: total,
      last_refreshed_at: latest || "Not refreshed yet",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===================================================
// ✅ GET /countries/image → serve summary image
// ===================================================
export const getCountriesImage = async (req, res) => {
  try {
    const countries = await Country.findAll({ raw: true });
    const filePath = await generateCountriesImage(countries);

    if (!filePath) {
      return res.status(404).json({ error: "No countries found. Run /countries/refresh first." });
    }

    return res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error("❌ Error generating image:", error);
    return res.status(500).json({ error: "Failed to generate summary image", details: error.message });
  }
};
