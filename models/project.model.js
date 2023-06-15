const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const projectSchema = new Schema (
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: [0, 'At least a positive value']
        },
        availableTonnes: {
            type: Number,
            required: true,
            min: [0, 'At least 1'],
        }
    },
    {timestamps: true}
);

module.exports = mongoose.model('Project', projectSchema);