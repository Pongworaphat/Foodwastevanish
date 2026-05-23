const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const {
  createDonation,
  getDonations,
  claimDonation,
  deleteDonation
} = require("../controllers/donationController");

router.post(
  "/",
  auth,
  upload.single("image"),
  createDonation
);

router.get("/", getDonations);

router.post("/:id/claim", auth, claimDonation);

router.delete("/:id", auth, deleteDonation);


module.exports = router;