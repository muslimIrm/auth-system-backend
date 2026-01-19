const mongoose = require("mongoose")


const Schema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    }
})


const Tokens = mongoose.model("Tokens", Schema)

module.exports = Tokens