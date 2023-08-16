const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const mg = require("nodemailer-mailgun-transport");

const mailgunAuth = {
  auth: {
    api_key: "cdb8f3d0610de33607024dc7f58f5932-aa4b0867-109e0510",
    domain:
      "https://app.mailgun.com/app/sending/domains/sandbox3ce45b8ccb694c768e813ab0ddf46375.mailgun.org",
  },
};

const sendEmail = async (email, subject, payload, template) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const source = fs.readFileSync(path.join(__dirname, template), "utf-8");
    const compiledTemplate = handlebars.compile(source);
    const options = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: subject,
      html: compiledTemplate(payload),
    };

    transporter.sendMail(options, (error, info) => {
      if (error) {
        console.log(`Error: ${error}`);
      } else {
        console.log(`Response: ${info}`);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendEmail;
