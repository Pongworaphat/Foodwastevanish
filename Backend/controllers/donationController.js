const Donation = require("../models/Donation");
const Chat = require("../models/Chat");

exports.createDonation = async (req, res) => {
  try {

    const donation = await Donation.create({
      ...req.body,
      donor: req.user.id
    });

    res.status(201).json(donation);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Create donation failed" });
  }
};

exports.getDonations = async (req, res) => {
  try {

    const donations = await Donation.find()
      .populate("donor", "username avatar")
      .sort({ createdAt: -1 });

    res.json(donations);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Get donations failed" });
  }
};

exports.claimDonation = async (req, res) => {
  try {

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found"
      });
    }

    if (donation.status !== "available") {
      return res.status(400).json({
        message: "Donation already claimed"
      });
    }

    donation.status = "claimed";
    donation.receiver = req.user.id;

    await donation.save();

    const chat = await Chat.create({
      donation: donation._id,
      donor: donation.donor,
      receiver: req.user.id
    });

    res.json({
      message: "Donation claimed",
      donation,
      chatId: chat._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Claim failed"
    });
  }
};