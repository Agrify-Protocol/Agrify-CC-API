const Waitlist = require("../models/waitlist.model");

const getWaitlist = async (req, res) => {
  try {
    const result = await Waitlist.find({}).sort({ createdAt: -1 }).exec();
    res.status(201).json({ message: "Waitlist Users", data: waitlist });
  } catch (error) {}
};

const addUsertoWaitlist = async (req, res) => {
  try {
    const { full_name, phone_number, email, farm_country, farm_size } =
      req.body;

    const waitlistUser = new Waitlist({
      full_name,
      phone_number,
      email,
      farm_country,
      farm_size,
    });
    await waitlistUser.save();
    res.status(201).json({ message: "Added to waitlist" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addUsertoWaitlist,
};
