const Employee = require('../models/employeeSchema');
const bcrypt = require('bcrypt');
const { check, validationResult } = require("express-validator");
const sendVerifyMail = require('../helpers/employeeVerification');
const nodemailer = require("nodemailer");
const { createToken, decodeToken } = require('../util/feature');


const loadRegister = async (req,res) => {
    try {
        
        res.render('register');

    } catch (error) {
        console.log(error.message);
    }
}

const insertEmployee = async (req,res) => {
    try {

        const data = validationResult(req);
            const errors = data.errors;
            if (errors.length > 0) {
                res.render('register', {errors: errors})
            }
        else{
            const spassword = await bcrypt.hash(req.body.password, 10);
            const employee = await new Employee({
                name: req.body.name,
                email: req.body.email,
                empCode: req.body.empCode,
                phone: req.body.phone,
                empImg: req.file.filename,
                empJobTitle: req.body.empJobTitle,
                password: spassword
            });
            // const token = await employee.createToken(employee._id);
            const empData = await employee.save();
            if(empData){
                sendVerifyMail(req.body.name, req.body.email, empData._id);
                res.render('register', { message: "Registration done Successfully, Please Verify" });
            }else{
                res.render('register', { message: "Registration Failed" });
            }
            
        }
    } catch (error) {
        console.log(error.message);
    }
}

const verifyMail = async (req, res) => {
    try {
      const updateInfo = await Employee.updateOne(
        { _id: req.query.id },
        { $set: { is_varified: 1 } }
      );
    //   res.render("email-varified");
      res.redirect('/login');
    } catch (error) {
      console.log(error.message);
    }
}

const loginLoad = async (req,res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req,res) => {
    const email = req.body.email;
    const password = req.body.password;

    const employeeData = await Employee.findOne({ email });
    if(employeeData){

        const passwordMatch = await bcrypt.compare(password, employeeData.password);
        if(passwordMatch){

            // if password is matched then we check mail is verified or not
            if (employeeData.is_varified === 0) {
                res.render("login", { message: "Please verify your Email." });
            } else {

                // JWT Authentication logic
                const token = await createToken(employeeData);
                res.cookie("EMS_Token", token, {
                    httpOnly: true
                    // maxAge: 15 * 60 * 1000,
                });

                res.redirect('/dashboard');

            }
        }else{
            res.render('login', { message: "Login Details are incorrect" });
        }

    }else{
        res.render('login', { message: "Login Details are incorrect" });
    }
}

const loadDashboard = async (req,res) => {
    try {

        const token = req.cookies.EMS_Token;
        if (!token) {
            res.render('unauthorizedError', {message: "You are Unauthorized"});
        }
        const employeeId = decodeToken(token);
        const employeeData = await Employee.findById({ _id: employeeId });

        res.render('dashboard', {user: employeeData});

    } catch (error) {
        console.log(error.message);
    }
}

const loadEmpDetail = async (req,res) => {
    try {

        res.render('employeeDetails');

    } catch (error) {
        consle.log(error.message);
    }
}

const loadUnauthorizedError = async (req,res) => {
    try {
        
        res.render('unauthorizedError');

    } catch (error) {
        console.log(error.message);
    }
}

const logout = async (req,res) => {
    try {
        
        res.clearCookie("EMS_Token");
        res.redirect('/login');

        // console.log("Logout done");

    } catch (error) {
        console.log(error.message);
    }
}

const editProfileLoad = async (req,res) => {
    try {

        const token = req.cookies.EMS_Token;
        if (!token) {
            res.render('unauthorizedError', {message: "You are Unauthorized"});
        }
        const employeeId = decodeToken(token);
        const employeeData = await Employee.findById({ _id: employeeId });
        if(employeeData){
            res.render('edit-profile', {empData : employeeData});
        }else{
            res.redirect('/dashboard', {empData : employeeData});
        }

    } catch (error) {
        console.log(error.message);
    }
}

const updateProfile = async (req,res) => {
    try {

        if (req.file) {
            const empData = await Employee.findByIdAndUpdate(
              { _id: req.body.user_id },
              {
                $set: {
                    name: req.body.name,
                    email: req.body.email,
                    empCode: req.body.empCode,
                    phone: req.body.phone,
                    empImg: req.file.filename,
                    empJobTitle: req.body.empJobTitle
                },
              }
            );
          } else {
            const empData = await Employee.findByIdAndUpdate(
              { _id: req.body.user_id },
              {
                $set: {
                    name: req.body.name,
                    email: req.body.email,
                    empCode: req.body.empCode,
                    phone: req.body.phone,
                    empJobTitle: req.body.empJobTitle
                },
              }
            );
          }
          res.redirect("/dashboard");

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadRegister,
    insertEmployee,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadDashboard,
    loadEmpDetail,
    loadUnauthorizedError,
    logout,
    editProfileLoad,
    updateProfile
}