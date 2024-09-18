// Handling Paystack

const paystackSkey = process.env.PAYSTACK_SECRET_KEY;
const axios = require("axios");
const Invoice = require("../models/invoice.model");
const tokenService = require("../service/tokenService");
const Purchase = require("../models/purchase.model");
const Project = require("../models/project.model");
const Token = require("../models/token.model");
const Aggregate = require("../models/aggregate.model");

const User = require("../models/user.model");
const crypto = require("crypto");

const paystackInitialize = async (req, res) => {
  const transactionDetails = {
    email: "customer@email.com",
    amount: 10000,
    metadata: {
      custom_fields: [
        {
          display_name: "Customer's name",
          variable_name: "customer_name",
          value: "John Doe",
        },
      ],
    },
  };
  try {
    axios
      .post(
        "https://api.paystack.co/transaction/initialize",
        transactionDetails,
        {
          headers: { Authorization: `Bearer ${paystackSkey}` },
        }
      )
      .then((response) => {
        res.status(200).json(response.data);
      })
      .catch((error) => {
        // res.status(500).json({ error: true, message: error });
        console.log(error.data);
      });
  } catch (error) {
    console.log(error);
  }
};

const payWithCard = async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: `User does not exists!` });
  }
  //   const { tonnes, amount, projectId } = req.body;
  const { tonnes, projectId } = req.body;

  // Check if the project exists
  const project = await Aggregate.findById(projectId);
  if (!project) {
    return res
      .status(404)
      .json({ message: `Project does not exist with ID ${projectId}` });
  }

  const projectToken = await Token.findById(project.projectToken);
  if (!projectToken) {
    return res
      .status(404)
      .json({ message: `Project does not have tokens available for sale` });
  }

  const totalCost = tonnes * 10 * 1500;

  //TOKEN TRANSFER
  const txReceipt = await tokenService.purchaseToken(projectToken.tokenId, tonnes*100, userId);
  console.log(`Transaction Receipt: ${txReceipt}`);
  try {

    axios
      .post(
        "https://api.paystack.co/transaction/initialize",
        {
          email: user.email,
          amount: parseFloat(totalCost) * 100,
          currency: "NGN",
          metadata: {
            type: "online_payment",
            userId: user.id,
            tonnes: tonnes,
            projectId: projectId,
          },
        },
        { headers: { Authorization: `Bearer ${paystackSkey}` } }
      )
      .then((response) => {
        res.status(200).json(response.data);
      })
      .catch((error) => {
        // res.status(500).json({ error: true, message: error });
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
};

const payInvoice = async (req, res) => {
  const { invoiceId } = req.params;
  const invoice = await Invoice.findById(invoiceId).populate("userId").exec();
  if (!invoice) {
    return res
      .status(404)
      .json({ message: `Invoice does not exist with ID ${invoiceId}` });
  }

  //   if (invoice.status === "paid") {
  //     return res.status(500).json({ message: "This invoice has been paid!" });
  //   }

  //   if (invoice.status === "cancelled") {
  //     return res.status(500).json({ message: "This invoice has been cancelled!" });
  //   }

  let payload = {};
  payload.invoiceId = invoice._id;
  payload.email = invoice.userId.email;
  payload.amount = invoice.amount;

  try {
    axios
      .post(
        "https://api.paystack.co/transaction/initialize",
        {
          email: payload.email,
          amount: parseFloat(payload.amount) * 100,
          currency: "NGN",
          metadata: {
            type: "invoice",
            invoice_details: {
              invoiceId: payload.invoiceId,
            },
          },
        },
        { headers: { Authorization: `Bearer ${paystackSkey}` } }
      )
      .then((response) => {
        res.status(200).json(response.data);
      })
      .catch((error) => {
        // res.status(500).json({ error: true, message: error });
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
};

const handlePaystackWebhook = async (req, res) => {
  const eventData = req.body;
  const signature = req.headers["x-paystack-signature"];
  if (!verifyPaystackSignature(eventData, signature)) {
    return res.sendStatus(400);
  }
  if (eventData.event === "charge.success") {
    if (eventData.data.metadata.type === "invoice") {
      const invoiceId = eventData.data.metadata.invoice_details.invoiceId;
      console.log(
        `Invoice Id from paystack was ${invoiceId} was successfully paid for via card`
      );

      // get the invoice id and update the invoice model and return it
      const invoice = await Invoice.findById(invoiceId);
      const purchase = await Purchase.findOne({ invoiceId });

      invoice.status = "paid";
      invoice.paymentReference = `paystack_${eventData.data.reference}`;

      if (purchase) {
        purchase.status = "confirmed";
        await purchase.save();
      }
      await invoice.save();

      console.log({ invoice, purchase });
    } else {
      // online payment
      // create a new purchase record
      const purchase = new Purchase({
        purchaseType: "card",
        status: "confirmed",
        tonnes: eventData.data.metadata.tonnes,
        amount: eventData.data.amount,
        projectId: eventData.data.metadata.projectId,
        userId: eventData.data.metadata.userId,
        paymentReference: `paystack_${eventData.data.reference}`,
      });

      await purchase.save();
      console.log(
        `Purchase with payment ID ${purchase.paymentReference} recorded...`
      );
      console.log(`New purchase for online payment recorded.... ${purchase}`);
    }
  }
  res.sendStatus(200);
};

const verifyPaystackSignature = (eventData, signature) => {
  const hmac = crypto.createHmac("sha512", paystackSkey);
  const expectedSignature = hmac
    .update(JSON.stringify(eventData))
    .digest("hex");
  return expectedSignature === signature;
};

module.exports = {
  paystackInitialize,
  payInvoice,
  handlePaystackWebhook,
  payWithCard,
};
