const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        firstname: {type: String},
        lastname: {type: String},
        email: {type: String, unique: true},
        password: {type: String},
        isAdmin: {type: Boolean, default: false}
    }, 
    {
        timestamps: true,
        toJSON: {
            transform: function(doc, ret) {
                delete ret._id;
                delete ret.__v;
                delete ret.password;
                delete ret.createdAt;
                delete ret.updatedAt;
            }
        }
    }
);

module.exports = mongoose.model('User', userSchema);