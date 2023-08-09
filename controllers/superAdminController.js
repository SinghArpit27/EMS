const Employee = require('../models/employeeSchema');
const bcrypt = require('bcrypt');
const { check, validationResult } = require("express-validator");
const mailService = require('../helpers/employeeVerification');
const nodemailer = require("nodemailer");
const { createToken, decodeToken } = require('../util/feature');
const randomstring = require('randomstring');



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
                role: req.body.role,
                password: spassword
            });
            // const token = await employee.createToken(employee._id);
            const empData = await employee.save();
            if(empData){
                // sendVerifyMail(req.body.name, req.body.email, empData._id);
                mailService.sendVerifyMail(req.body.name, req.body.email, empData._id);
                res.render('register', { message: "Registration done Successfully, Please Verify" });
            }else{
                res.render('register', { message: "Registration Failed" });
            }
            
        }

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
    try {
        const email = req.body.email;
        const password = req.body.password;

        const employData = await Employee.findOne({email:email});
        if (employData) {

            const passwordMatch = await bcrypt.compare(password, employData.password);
            if (passwordMatch) {
                
                if (employData.role === 1) {

                    const token = await createToken(employData);
                    res.cookie("EMS_Token", token, {
                        httpOnly: true
                    });
                    res.redirect('/superAdmin/dashboard');

                } else {
                    res.render('login',{message:"Email and Password is incorrect"});                    
                }

            } else {
                res.render('login',{message:"Email and Password is incorrect"});
            }
        } else {
            res.render('login',{message:"Email and Password is incorrect"});
        }

        





    } catch (error) {
        console.log(error.message);
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
            res.redirect('/superAdmin/dashboard', {empData : employeeData});
        }

    } catch (error) {
        console.log(error.message)
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
          res.redirect("/superAdmin/dashboard");

    } catch (error) {
        console.log(error.message);
    }
}

const loadOU = async (req,res) => {
    try {
        
        const token = req.cookies.EMS_Token;
        if (!token) {
            res.render('unauthorizedError', {message: "You are Unauthorized"});
        }
        const employeeId = decodeToken(token);
        const employeeData = await Employee.findById({ _id: employeeId });



        // Find Length Of Employees
        const allEmploy = await Employee.find({});
        var role2Length = 0;
        var role3Length = 0;
        var role1Length = 0;

        for(let i = 0; i < allEmploy.length; i++){
            // console.log("role", allEmploy[i].role);
            if(allEmploy[i].role == 2){
                role2Length++;
            }
            else if(allEmploy[i].role == 3){
                role3Length++;
            }else{
                role1Length++;
            }
        }
        res.render('organinsationOU', {user: employeeData, role2Length, role3Length});

    } catch (error) {
        console.log(error.message);
    }
}

const loadAdminsList = async (req,res) => {
    try {
        
        const token = req.cookies.EMS_Token;
        if (!token) {
            res.render('unauthorizedError', {message: "You are Unauthorized"});
        }
        const employeeId = decodeToken(token);
        const employeeData = await Employee.findById({ _id: employeeId });


        // Get Admins data
        const adminData = await Employee.find({role:2});

        res.render("admins", { user: employeeData, admins: adminData });

    } catch (error) {
        console.log(error.message);
    }
}

const loadEmploysList = async (req,res) => {
    try {
        
        const token = req.cookies.EMS_Token;
        if (!token) {
            res.render('unauthorizedError', {message: "You are Unauthorized"});
        }
        const employeeId = decodeToken(token);
        const employeeData = await Employee.findById({ _id: employeeId });


        // Get Admins data
        const employData = await Employee.find({role:3});

        res.render("employs", { user: employeeData, employs: employData });

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadRegister,
    insertEmployee,
    loginLoad,
    verifyLogin,
    loadDashboard,
    editProfileLoad,
    updateProfile,
    loadOU,
    loadAdminsList,
    loadEmploysList
}