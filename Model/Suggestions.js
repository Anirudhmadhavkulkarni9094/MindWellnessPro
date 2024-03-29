const mongoose = require("mongoose");

const suggestionSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    suggestion : {
        type : String,
        required : true
    }
})

const suggestionModel = mongoose.model("Suggestions" , suggestionSchema);

module.exports = suggestionModel