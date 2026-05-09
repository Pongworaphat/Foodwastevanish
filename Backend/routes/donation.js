const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createDonation,
  getDonations,
  claimDonation
} = require("../controllers/donationController");

router.post("/", auth, createDonation);

router.get("/", getDonations);

router.post("/:id/claim", auth, claimDonation);

module.exports = router;