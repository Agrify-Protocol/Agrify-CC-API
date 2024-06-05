const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "At least a positive value"],
    },
    availableTonnes: {
      type: Number,
      required: true,
      min: [0, "At least 1"],
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    images: [
      {
        image: { type: String, required: true },
        description: { type: String, required: false },
      },
    ],
    coverImage: {
      type: String,
    },
    projectId: {
      type: String,
      required: true,
    },
    minimumPurchaseTonnes: {
      type: Number,
      required: true,
      default: 0,
    },
    location: {
      type: String,
    },
    countryOfOrigin: {
      type: String,
      required: true,
    },
    projectProvider: {
      type: String,
    },
    projectWebsite: {
      type: String,
    },
    blockchainAddress: {
      type: String,
    },
    typeOfProject: {
      type: String,
    },
    certification: {
      type: String,
    },
    certificationURL: {
      type: String,
    },
    certificateCode: {
      type: String,
    },
    creditStartDate: {
      type: Date,
    },
    creditEndDate: {
      type: Date,
    },
    supportingDocument: {
      type: String,
    },
    projectToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Token",
    },
    //TODO: Add farmID
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
