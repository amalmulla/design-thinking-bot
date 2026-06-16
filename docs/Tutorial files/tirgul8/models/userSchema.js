const mongoose = require("mongoose"); 
let User = new mongoose.Schema( 
    { 
    name: { type: String, unique: true, }, 
    job: { type: String, }, 
    children: { type: Number, },
    courses: { type: Array, }, 
    },
    { collection: "Users", versionKey: false }
);   
module.exports = mongoose.model("Users", User);
