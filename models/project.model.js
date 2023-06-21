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
        },
        tags: [{
            type: Schema.Types.ObjectId,
            ref:'Tag'
        }],
        images: [{
            type: String,
        }],
    },
    {timestamps: true}
);

module.exports = mongoose.model('Project', projectSchema);