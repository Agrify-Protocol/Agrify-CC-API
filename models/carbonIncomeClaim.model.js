const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const carbonIncomeClaimSchema = new Schema(
    {
        farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'MrvUser' },
        farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm' },
        wasteDisposalDescription: {
            type: String,
            required: true
        },
        fertilizer: {
            type: String,
            required: true
        },
        farmDocs: [{ type: String, required: true }],
    },
    { timestamps: true,
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

module.exports = mongoose.model("CarbonIncomeClaim", carbonIncomeClaimSchema);