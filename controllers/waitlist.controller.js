const Waitlist = require("../models/waitlist.model");

const getWaitlist = async (req, res) => {
  try {
    const result = await Waitlist.find({}).sort({ createdAt: -1 }).exec();
    res.status(200).json({ message: "Waitlist Users", data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addUsertoWaitlist = async (req, res) => {
  try {
    const { full_name, phone_number, email, farm_country, farm_size } =
      req.body;

    const userExists = await Waitlist.findOne({ email: req.email });
    if (userExists) {
      throw new Error("User already exist ");
    }

    const result = await Waitlist.create({
      full_name,
      phone_number,
      email,
      farm_country,
      farm_size,
    });
    await result.save();
    res.status(201).json({ message: "User Added to Waitlist" });
  } catch (error) {
    if (error.code && error.code === 11000) {
      const message = `${Object.keys(
        error.keyValue
      )} field must be unique. A record with the provided unique field already exists`;
      return res.status(500).json({ message });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addUsertoWaitlist,
  getWaitlist,
};
