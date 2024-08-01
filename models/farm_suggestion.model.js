const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema(
  { Task: { type: String, required: true } },
  { _id: false }
);

const monthSchema = new Schema({ Tasks: [taskSchema] }, { _id: false });

const farmSuggestionSchema = new Schema(
  {
    PeriodStart: { type: Date, required: true },
    PeriodEnd: { type: Date, required: true },
    // FarmerId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "MrvUser",
    //   required: true,
    // },
    FarmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },
    FarmerName: { type: String },
    FarmScore: { type: Number, required: true },
    RecommendationsIntro: { type: String, required: true },
    Month1: { type: monthSchema, required: true },
    Month2: { type: monthSchema, required: true },
    Month3: { type: monthSchema, required: true },
    RecommendationsSummary: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FarmSuggestion", farmSuggestionSchema);
