const Employee = require('../models/employeeSchema');
const bcrypt = require('bcrypt');
const { check, validationResult } = require("express-validator");
const mailService = require('../helpers/employeeVerification');
const nodemailer = require("nodemailer");
const { createToken, decodeToken } = require('../util/feature');
const randomstring = require('randomstring');



const loginLoad = async (req,res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async (req,res) => {
    try {
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loginLoad,
    verifyLogin
}