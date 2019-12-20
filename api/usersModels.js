const mongoose = require("mongoose");

const timestamps = require('mongoose-timestamp');
const uniqueValidator = require('mongoose-unique-validator');


const userSchema = mongoose.Schema({
    _id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    name: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: String,
        required: false
    },
    gender: {
        type: String,
        required: false
    },
    email: {
        type: String,
        unique: true,
        required: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    contactNum: {
        type: String,
        unique: true,
        required: false
    },
    balance: {
        type: Number,
        required: false

    },
    settings: {
        type: Object,
        required: false
    },
    role:{
        type: String,
        required: true
    }

});
userSchema.plugin(uniqueValidator);
userSchema.plugin(timestamps);

module.exports = mongoose.model('User', userSchema);