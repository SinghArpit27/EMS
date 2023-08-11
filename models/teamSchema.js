const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee'
        }
    ],
    projectManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }
});

module.exports = mongoose.model('Team', teamSchema);