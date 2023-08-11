const Employee = require('../models/employeeSchema');
const Team = require('../models/teamSchema');
const bcrypt = require('bcrypt');
const { check, validationResult } = require("express-validator");
const mailService = require('../helpers/employeeVerification');
const nodemailer = require("nodemailer");
const { createToken, decodeToken } = require('../util/feature');
const randomstring = require('randomstring');
const excelJS = require('exceljs');



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
            const password = randomstring.generate(6);
            const spassword = await bcrypt.hash(password, 10);
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
            const empData = await employee.save();
            if(empData){
                // sendVerifyMail(req.body.name, req.body.email, empData._id);
                mailService.addEmployMail(req.body.name, req.body.email, password,  empData._id);
                res.render('register', { message: "Registration done Successfully" });
            }else{
                res.render('register', { message: "Registration Failed" });
            }
            
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
            res.redirect('/admin/dashboard', {empData : employeeData});
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
          res.redirect("/admin/dashboard");

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


        // Get Employs Data
        var search = '';
        if(req.query.search){
            search = req.query.search;
        }

        var page = 1;
        if(req.query.page){
            page = req.query.page;
        }

        const limit = 4;

        const employData = await Employee.find({
            role:3,
            $or:[
                { name: { $regex: '.*' + search + '.*', $options:'i' } },
                { email: { $regex: '.*' + search + '.*', $options:'i' } },
                { phone: { $regex: '.*' + search + '.*', $options:'i' } },
                { empCode: { $regex: '.*' + search + '.*', $options:'i' } }
            ]
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();


        const count = await Employee.find({
            role:3,
            $or:[
                { name: { $regex: '.*' + search + '.*', $options:'i' } },
                { email: { $regex: '.*' + search + '.*', $options:'i' } },
                { phone: { $regex: '.*' + search + '.*', $options:'i' } },
                { empCode: { $regex: '.*' + search + '.*', $options:'i' } }
            ]
        }).countDocuments();

        
        res.render("employs", { 
            user: employeeData,
            employs: employData,
            totalPages: Math.ceil(count/limit),
            currentPage: page,
            next:page+1,
            previous:page-1
        });

    } catch (error) {
        console.log(error.message);
    }
}

const loadEditEmploy = async (req,res) => {
    try {
        
        const emp_id = req.query.id;

        const employData = await Employee.findById({ _id: emp_id });
        if(employData){
            res.render('edit-employ', { employ: employData });
        }else{
            res.redirect('/admin/dashboard');
        }

    } catch (error) {
        console.log(error.message);
    }
}

const updateEmployProfile = async (req,res) => {
    try {
        // console.log(req.body.employ_id, req.body.name);
        const updatedData = await Employee.findByIdAndUpdate(
            { _id:req.body.employ_id },
            { $set:{

                name: req.body.name,
                email: req.body.email,
                empCode: req.body.empCode,
                phone: req.body.phone,
                empJobTitle: req.body.empJobTitle,
                role: req.body.role,
                is_varified: req.body.verify
            }}
        );

        res.redirect('/admin/employsList');

    } catch (error) {
        console.log(error.message);
    }
}

const loadSendMail = async (req,res) => {
    try {

        const token = req.cookies.EMS_Token;
        if (!token) {
            res.render('unauthorizedError', {message: "You are Unauthorized"});
        }
        const employeeId = decodeToken(token);
        const employeeData = await Employee.findById({ _id: employeeId });

        res.render('mail', {user: employeeData});

    } catch (error) {
        console.log(error.message);
    }
}

const sendMail = async (req,res) => {
    try {

        const token = req.cookies.EMS_Token;
        if (!token) {
            res.render('unauthorizedError', {message: "You are Unauthorized"});
        }
        const employeeId = decodeToken(token);
        const employeeData = await Employee.findById({ _id: employeeId });



        const subject = req.body.subject;
        const message = req.body.message;

        const employData = await Employee.find({role:3});

        if(employData) {
            for(let i = 0; i < employData.length; i++){
            mailService.sendMailToAll(employData[i].name, employData[i].email, subject, message)
            }
        }else{
            res.render('mail', { user: employeeData, message: "Employs Not Found" });
        }
        res.render('mail', { user: employeeData, message: "Message sent successfully done" });

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

const deleteEmploy = async (req,res) => {
    try {
        
        const id = req.query.id;
        await Employee.deleteOne({ _id: id });
        res.redirect('/admin/employsList');

    } catch (error) {
        console.log(error.message);
    }
}

const loadForgetPassword = async (req,res) => {
    try {
        
        res.render('forgetPassword');

    } catch (error) {
        console.log(error.message);
    }
}

const resetPassword = async (req,res) => {
    try {
        
        const email = req.body.email;
        const employData = await Employee.findOne({ email: email });
        if(employData){
            if(employData.is_varified === 0){
                res.render('forgetPassword', { message: "Your Email is not varified, please very your email" });
            }else{
                const randomString = randomstring.generate();
                const updatedData = await Employee.updateOne(
                    { email: email },
                    { $set:{ token: randomString } }
                );
                mailService.sendResetPasswordMail(employData.name, employData.email, randomString);
                res.render('forgetPassword', {message: "Please check your mail to Reset Password"});
            }
        }else{
            res.render('forgetPassword', { message: "Email is incorrect" });
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const resetPasswordLoad = async (req,res) =>{
    try {
        
        const token = req.query.token;
        const employData = await Employee.findOne({ token: token });
        if(employData){

            res.render('resetPassword', { employ_id: employData._id });

        }else{
            res.render('notFound', {message: "Invalid token"});
        }

    } catch (error) {
        console.log(error.message);
    }
}

const verifyresetPassword = async (req,res) => {
    try {
        
        const password = req.body.password;
        const employ_id = req.body.employ_id;

        const spassword = await bcrypt.hash(password, 10);

        const updatedData = await Employee.findByIdAndUpdate(
            { _id: employ_id },
            { $set: { password: spassword, token: "" } }
        );
        res.redirect('/login');

    } catch (error) {
        console.log(error.message);
    }
}

const loadEmployPortal = async (req,res) => {
    try {

        const employeeId = req.params.employeeId;

        // Find the employee by ID
        const employee = await Employee.findById(employeeId);

        if (!employee) {
            res.render('unauthorizedError');
        }
            // Find the team information for the employee's teamID
        let teamInfo = null;
        if (employee.teamID) {
            teamInfo = await Team.findById(employee.teamID)
            .populate('members', 'name empCode empJobTitle empImg')
            .populate('projectManager', 'name empCode empJobTitle empImg');
            res.render('my-profile', { employee, teamInfo, user: employee });
        }else{
            res.render('my-profile2', {user: employee});
        }
        

    } catch (error) {
        console.log(error.message);
    }
}

const loadEmployPortal2 = async (req,res) =>{
    try {
        
        res.render('my-profile2');

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadRegister,
    insertEmployee,
    loadDashboard,
    editProfileLoad,
    updateProfile,
    loadEmploysList,
    loadEditEmploy,
    updateEmployProfile,
    loadSendMail,
    sendMail,
    logout,
    deleteEmploy,
    loadEmployPortal,
    loadForgetPassword,
    resetPassword,
    resetPasswordLoad,
    verifyresetPassword,
    loadEmployPortal2
}