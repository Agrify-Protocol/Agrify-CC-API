const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const waitlistSchema = new Schema(
  {
    full_name: { type: String, required: true },
    phone_number: { type: String },
    email: { type: String, unique: true, required: true },
    farm_country: { type: String, required: true },
    farm_size: { type: Number, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

module.exports = mongoose.model("Waitlist", waitlistSchema);
