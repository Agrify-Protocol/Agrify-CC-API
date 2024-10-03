const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const farmSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ""
        },
        cultivationType: {
            type: String,
            default: ""
        },
        country: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        preferredLanguage: {
            type: String,
            enum: ['english', 'swahili', 'pidgin', 'arabic', 'french', 'portuguese', 'spanish'],
            default: "english"
        },
        farmDocs: [{ type: String, required: true }],
        farmImages: [
            {
                _id: false,
                image: { type: String, required: true },
                description: { type: String, required: false },
            },
        ],
        milestones: [
            {
                _id: false,
                title: { type: String, required: true },
                funding: { type: Number, required: true },
                duration: { type: Number, required: true },
            },
        ],
        category: {
            type: String,
            enum: ['cassava', 'yam', 'tomato', 'soybean', 'rice', 'maize'],
            required: true
        },
        lat: {
            type: Number,
        },
        long: {
            type: Number,
        },
        area: { type: Number },
        farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'MrvUser' },
        farmSuggestion: { type: mongoose.Schema.Types.ObjectId, ref: 'FarmSuggestion' },
        soilData: { type: mongoose.Schema.Types.ObjectId, ref: 'SoilData' },
        availableTonnes: { type: Number },

    },
    { timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
              delete ret.__v;
              delete ret.createdAt;
              delete ret.updatedAt;
            },
          },
      
     }
);

module.exports = mongoose.model("Farm", farmSchema);