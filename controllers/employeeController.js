const Employee = require('../models/employeeSchema');
const Team = require('../models/teamSchema');
const Task = require('../models/taskSchema');
const bcrypt = require('bcrypt');
const { check, validationResult } = require("express-validator");
const mailService = require('../helpers/employeeVerification');
const nodemailer = require("nodemailer");
const { createToken, decodeToken } = require('../util/feature');
const randomstring = require('randomstring');



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
            if (employeeData.is_varified === 1) {
                if(employeeData.role === 1){
                    // JWT Authentication logic
                    const token = await createToken(employeeData);
                    res.cookie("EMS_Token", token, {
                        httpOnly: true
                    });
                    res.redirect('/superAdmin/dashboard');
                }
                else if(employeeData.role === 2){
                    // JWT Authentication logic
                    const token = await createToken(employeeData);
                    res.cookie("EMS_Token", token, {
                        httpOnly: true
                    });
                    res.redirect('/admin/dashboard');
                }
                else if(employeeData.role === 3){
                    // JWT Authentication logic
                    const token = await createToken(employeeData);
                    res.cookie("EMS_Token", token, {
                        httpOnly: true
                    });
                    res.redirect('/dashboard');
                }
                
                
                
                
                
                
                
                else{
                    res.render('login', { message: "Login Details are incorrect" });
                }
            } else {              
                
                res.render("login", { message: "Please verify your Email." });
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

const emailVerificationLinkLoad = async (req,res) => {
    try {
        
        res.render('email-verify');

    } catch (error) {
        console.log(error.message);
    }
}

const emailVerificationLink = async (req,res) => {
    try {
        const email = req.body.email;

        const employData = await Employee.findOne({ email: email });
        if(employData){
            mailService.sendVerifyMail(employData.name, employData.email, employData._id);
            res.render("email-verify", {
                message:
                  "verification mail is sent in your registered mail id please check",
              });
        }else{
            res.render("email-verify", { message: "This email is not exist" });
        }
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
            res.render('my-profile', { message: "Not Found ", employee, teamInfo, user: employee });
        }

        // Find the team information for the employee's teamID
        let teamInfo = null;
        if (employee.teamID) {
            teamInfo = await Team.findById(employee.teamID)
            .populate('members', 'name empCode empJobTitle empImg')
            .populate('projectManager', 'name empCode empJobTitle empImg');
            res.render('my-profile', { employee, teamInfo, user: employee });

        }else{
            res.render('my-profile2', { user: employee });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadEmployPortal2 = async (req,res) => {
    try {
        
        res.render('my-profile2');

    } catch (error) {
        console.log(error.message);
    }
}

const loadTask = async (req,res) => {
    try {

        const token = req.cookies.EMS_Token;
        if (!token) {
            res.render('unauthorizedError', {message: "You are Unauthorized"});
        }
        const employeeId = decodeToken(token);
        const employeeData = await Employee.findById({ _id: employeeId });


        const employId = employeeId;
        const admin = await Employee.findById(employId).populate('teamID');

        if (!admin || admin.role !== 3) {
            return res.status(403).send('Permission denied');
        }
        const tasks = await Task.find({ team: admin.teamID }).populate('createdBy assignedTo');

        res.render('my-task', { admin, tasks, user: employeeData });

    } catch (error) {
        console.log(error.message);
    }
}

const updateTaskStatus = async (req,res) => {
    try {
        
        const taskId = req.params.taskId;
        const status = req.body.status;

        const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true });
        res.redirect('/employ-tasks');

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    verifyMail,
    loginLoad,
    verifyLogin,
    loadDashboard,
    loadEmpDetail,
    loadUnauthorizedError,
    logout,
    editProfileLoad,
    updateProfile,
    loadForgetPassword,
    resetPassword,
    resetPasswordLoad,
    verifyresetPassword,
    emailVerificationLinkLoad,
    emailVerificationLink,
    loadEmployPortal,
    loadEmployPortal2,
    loadTask,
    updateTaskStatus
}