const mongoose = require("mongoose");

const timestamps = require('mongoose-timestamp');
const uniqueValidator = require('mongoose-unique-validator');


const tokenSchema = mongoose.Schema({
    _id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    refToken: {
        type: String,
        unique: true,
        required: true
    }
});
tokenSchema.plugin(uniqueValidator);
tokenSchema.plugin(timestamps);

module.exports = mongoose.model('Token', tokenSchema);