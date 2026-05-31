const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const {
  createDonation,
  getDonations,
  deleteDonation,
  claimDonation,
  updateDonation,
  completeDonation,
} = require("../controllers/donationController");

router.post("/", auth, upload.single("image"), createDonation);
router.get("/", getDonations);
router.post("/:id/claim", auth, claimDonation);
router.delete("/:id", auth, deleteDonation);
router.put("/:id", auth, upload.single("image"), updateDonation);

router.post("/:id/complete", auth, completeDonation); 

module.exports = router;