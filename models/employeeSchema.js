const mongoose = require('mongoose');
const employeeSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    empCode:{
        type: String,
        required: true,
        unique: true
    },
    phone:{
        type: String,
        required: true
    },
    empImg:{
        type:String
    },
    empJobTitle:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    is_admin:{
        type:Number,
        default:0
    },
    is_varified:{
        type:Number,
        default:0
    },
    token:{
        type:String,
        default:''
    }
});

module.exports = mongoose.model("Employee", employeeSchema);