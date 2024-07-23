const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const aggregateSchema = new Schema(
  {
    projectId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    mission: {
      type: String,
      required: true,
    },
    methodology: {
      type: String,
      required: true,
    },
    // price: {
    //   type: Number,
    //   required: true,
    //   min: [0, "At least a positive value"],
    // },
    // availableTonnes: {
    //   type: Number,
    //   required: true,
    //   min: [0, "At least 1"],
    //   default: 0,
    // },
    // totalTonnes: {
    //   type: Number,
    //   required: true,
    //   min: [0, "At least 1"],
    //   default: 0,
    // },
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
    // minimumPurchaseTonnes: {
    //   type: Number,
    //   required: true,
    // },
    location: {
      type: String,
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true,
    },  
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum : ['cassava', 'yam', 'tomato', 'soybean', 'rice', 'maize'],
      required: true
  },
// projectProvider: {
    //   type: String,
    // },
    // projectWebsite: {
    //   type: String,
    // },
    // blockchainAddress: {
    //   type: String,
    // },
    // typeOfProject: {
    //   type: String,
    // },
    // certification: {
    //   type: String,
    // },
    // certificationURL: {
    //   type: String,
    // },
    // certificateCode: {
    //   type: String,
    // },
    creditStartDate: {
      type: Date,
    },
    creditEndDate: {
      type: Date,
    },
    supportingDocument: {
      type: String,
    },
    contractType: {
      type: String,
      required: true,
    },
    projectToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Token",
    },
    farms: [
      {
        type: Schema.Types.ObjectId,
        ref: "Farm",
      },
    ],

    //TODO: Add farmID
  },
  { timestamps: true }
);

module.exports = mongoose.model("Aggregate", aggregateSchema);
