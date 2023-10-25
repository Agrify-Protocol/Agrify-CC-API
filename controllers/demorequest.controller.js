const DemoRequest = require("../models/demoRequest.model");

const sendEmail = require("../utils/sendEmail");
const createDemoRequest = async (req, res) => {
  try {
    const { firstname, lastname, email, companyName, engagementType } =
      req.body;
    const newRequest = await DemoRequest.create({
      firstname,
      lastname,
      email,
      companyName,
      carbonCreditEngagement: engagementType,
    });
    newRequest.save();
    sendEmail(
      "admin@agrifyafrica.xyz",
      "Demo Request for Agrify",
      {
        firstname,
        lastname,
        companyName,
        engagementType,
        email,
      },
      "./email/template/demoRequest.handlebars"
    );
    res.status(201).json(newRequest);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const getDemoRequests = async (req, res) => {
  try {
    const requests = await DemoRequest.find({});
    res.status(200).json({ requests });
  } catch (error) {
    console.log("Error fetching demo requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { createDemoRequest, getDemoRequests };
