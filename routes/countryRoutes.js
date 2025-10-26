import express from "express";
import {
  refreshCountries,
  getCountries,
  getCountryByName,
  deleteCountry,
  getStatus,
  getCountriesImage,
} from "../controllers/countryController.js";

const router = express.Router();

router.post("/refresh", refreshCountries);
router.get("/", getCountries);
router.get("/status", getStatus);
router.get("/image", getCountriesImage);
router.get("/:name", getCountryByName);
router.delete("/:name", deleteCountry);

export default router;
