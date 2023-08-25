const ContactMessage = require("../models/contactMessage.model");
const createMessage = async (req, res) => {
  try {
    const { firstname, lastname, email, userType, message } = req.body;
    // console.log({ firstname, lastname, email, user_type, message });
    const newMessage = await ContactMessage.create({
      firstname,
      lastname,
      email,
      userType,
      message,
    });
    res.status(201).json(newMessage);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find({});
    res.status(200).json({ messages });
  } catch (error) {
    console.log("Error fetching projects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { createMessage, getContactMessages };
