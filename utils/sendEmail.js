const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const mg = require("nodemailer-mailgun-transport");

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
