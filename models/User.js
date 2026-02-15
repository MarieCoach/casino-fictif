const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 100
    },
    lastBonus: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model("User", userSchema);