const Employee = require('../models/employeeSchema');
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
        const totalLength = allEmploy.length;

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
        res.render('organinsationOU', {user: employeeData, role2Length, role3Length, totalLength});

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

// Load Update Employ Profile Page
const loadEditEmploy = async (req,res) => {
    try {
        
        const emp_id = req.query.id;

        const employData = await Employee.findById({ _id: emp_id });
        if(employData){
            res.render('edit-employ', { employ: employData });
        }else{
            res.redirect('/superAdmin/dashboard')
        }

    } catch (error) {
        console.log(error.message);
    }
}

// Update Employ Profile
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

        res.redirect('/superAdmin/organisationalUnit');

    } catch (error) {
        console.log(error.message);
    }
}

// Export Employs Details
const exportEmploys = async (req,res) => {
    try {
        
        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("My Employees");

        worksheet.columns = [
            { header: "S.no", key:"s_no" },
            { header: "Name", key:"name" },
            { header: "Email ID", key:"email" },
            { header: "Employee Code", key:"empCode" },
            { header: "Mobile", key:"phone" },
            { header: "Image", key:"empImg" },
            { header: "Job Title", key:"empJobTitle" },
            { header: "Role", key:"role" },
            { header: "Is Verified", key:"is_varified" },
        ];
        let counter = 1;

        const employData = await Employee.find({});
        // const employData2 = await Employee.find({ role: 3});
        

        employData.forEach((employ) => {
            employ.s_no = counter;
            worksheet.addRow(employ);
            counter++;
        });

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
        );

        res.setHeader("Content-Disposition",`attachment; filename=Employees.xlsx`);

        return workbook.xlsx.write(res).then(()=>{
            res.status(200);
        });


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

        res.render('mail', {user: employeeData});

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
    loadOU,
    loadAdminsList,
    loadEmploysList,
    loadEditEmploy,
    updateEmployProfile,
    exportEmploys,
    sendMail
    
}