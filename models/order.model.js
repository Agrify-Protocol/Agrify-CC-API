const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const orderSchema = new Schema (
    {
        orderReferenceId: {
            type: String,
            required: true
        },
        certificateInfo: {
            certificateType: {
                type: String,
                required: true
            },
            firstname: {
                type: String,
                required: true
            },
            lastname: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            address: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            postalcode: {
                type: String,
                required: true
            },
            reason: {
                type: String,
                required: true
            }
        }
    },{
        timestamps: true
    }
);

module.exports = mongoose.model('Order', orderSchema);