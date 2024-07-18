const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const farmSchema = new Schema (
    {
        name: {
            type: String,
            required: true
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
        farmPhotos: [ { type: String, required: true } ],
        farmDocs: [ { type: String, required: true } ],
        category: {
            type: String,
            enum : ['cassava', 'yam', 'tomato', 'soybean', 'rice', 'maize'],
            required: true
        },
        lat: {
            type: Number,
        },
        long: {
            type: Number,
        },
        area: {type: Number},
        farmer: {type: mongoose.Schema.Types.ObjectId, ref: 'MrvUser'},
        availableTonnes: {type: Number},

    },
    {timestamps: true}
);

module.exports = mongoose.model("Farm", farmSchema);