const Donation = require("../models/Donation");

exports.createDonation = async (req, res) => {
  try {
    const donation = await Donation.create({
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : "",
      donor: req.user.id
    });

    res.status(201).json(donation);
  } catch (error) {
    console.error(error.message);
    console.error(error);
    res.status(500).json({ message: "Create donation failed" });
  }
};

exports.getDonations = async (req, res) => {
  try {
    const today = new Date();

    const expiredDonations = await Donation.find({
      status: "available",
      expDate: { $ne: "" }
    });

    for (const donation of expiredDonations) {

      const exp = new Date(donation.expDate);

      if (exp < today) {

        donation.status = "expired";

        await donation.save();
      }
    }

    const donations = await Donation.find()
      .populate("donor", "username avatar rating")
      .populate("receiver", "username avatar rating")
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    console.error(error.message);
    console.error(error);
    res.status(500).json({ message: "Get donations failed" });
  }
};

exports.claimDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.donor.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot claim your own donation" });
    }

    if (donation.status === "expired") {
      return res.status(400).json({
        message: "Donation expired"
      });
    }

    if (donation.status !== "available") {
      return res.status(400).json({ message: "Donation already claimed" });
    }

    donation.status = "claimed";
    donation.receiver = req.user.id;
    await donation.save();

    res.json({
      message: "Donation claimed",
      donation
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Claim failed" });
  }
};

exports.completeDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    console.log("req.user =", req.user);
    console.log("donor =", donation.donor.toString());

    if (
      donation.donor.toString() !== req.user.id &&
      donation.receiver?.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    if (donation.donor.toString() === req.user.id) {
      donation.ownerConfirmed = true;
    }

    if (donation.receiver?.toString() === req.user.id) {
      donation.receiverConfirmed = true;
    }

    if (donation.ownerConfirmed && donation.receiverConfirmed) {
      donation.status = "completed";
    }

    console.log({
      ownerConfirmed: donation.ownerConfirmed,
      receiverConfirmed: donation.receiverConfirmed,
      status: donation.status,
    });
    await donation.save();

    res.json({
      message: "Donation updated",
      donation,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Complete failed" });
  }
};

exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found",
      });
    }

    if (
      donation.donor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await donation.deleteOne();

    res.json({
      message: "Donation deleted",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Delete failed",
    });
  }
};

exports.updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.donor.toString() !== req.user.id) {
    }

    const updatedData = { ...req.body };

    if (req.file) {
      updatedData.image = `/uploads/${req.file.filename}`;
    }

    const updatedDonation = await Donation.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    )
      .populate("donor", "username avatar rating")
      .populate("receiver", "username avatar rating");
    res.json(updatedDonation);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update donation failed" });
  }
};