const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const soilDataSchema = new Schema(
  {
    PeriodStart: { type: Date, required: true },
    PeriodEnd: { type: Date, required: true },
    // FarmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'MrvUser', required: true },
    FarmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },
    FarmerName: { type: String },
    ClayContent: { type: Number, required: true },
    CEC: { type: String, required: true },
    SoilDepth: { type: String, required: true },
    SiltContent: { type: String, required: true },
    SandContent: { type: String, required: true },
    SoilMoisture: { type: String, required: true },
    SoilPH: { type: String, required: true },
    NitrogenContent: { type: String, required: true },
    BulkDensity: { type: String, required: true },
    Area: { type: Number },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret._id;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
  }
);

module.exports = mongoose.model("SoilData", soilDataSchema);
