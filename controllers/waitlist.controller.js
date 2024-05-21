const Waitlist = require("../models/waitlist.model");

const getWaitlist = async (req, res) => {
  try {
    const result = await Waitlist.find({}).sort({ createdAt: -1 }).exec();
    res.status(201).json({ message: "Waitlist Users", data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addUsertoWaitlist = async (req, res) => {
  try {
    const { full_name, phone_number, email, farm_country, farm_size } =
      req.body;

    if (Waitlist.findOne({ email: req.email })) {
      res.status(400).json({ message: "User already exists" });
    }

    else {
      const waitlistUser = new Waitlist({
        full_name,
        phone_number,
        email,
        farm_country,
        farm_size,
      });
      await waitlistUser.save();
      res.status(201).json({ message: "Added to waitlist" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addUsertoWaitlist,
  getWaitlist,
};
