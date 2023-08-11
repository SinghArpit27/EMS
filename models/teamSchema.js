const mongoose = require('mongoose');

const teamSchema = mongoose.Schema({
    teamName:{
        type: String,
        required: true,
        unique: true
    },
    employeesID:[String]
});

module.exports = mongoose.model('Team', teamSchema);