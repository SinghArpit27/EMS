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
        var search = '';
        if(req.query.search){
            search = req.query.search;
        }

        var page = 1;
        if(req.query.page){
            page = req.query.page;
        }

        const limit = 4;
        const adminData = await Employee.find({
            role:2,
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
            role:2,
            $or:[
                { name: { $regex: '.*' + search + '.*', $options:'i' } },
                { email: { $regex: '.*' + search + '.*', $options:'i' } },
                { phone: { $regex: '.*' + search + '.*', $options:'i' } },
                { empCode: { $regex: '.*' + search + '.*', $options:'i' } }
            ]
        }).countDocuments();

        res.render("admins", {
            user: employeeData,
            admins: adminData,
            totalPages: Math.ceil(count/limit),
            currentPage: page,
            next:page+1,
            previous:page-1
        });

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

        const employData = await Employee.find({});

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
        res.redirect('/superAdmin/organisationalUnit');

    } catch (error) {
        console.log(error.message);
    }
}

const loadTeams = async (req,res) => {
    try {

        // Fetch admins and employees from the database
        const admins = await Employee.find({ role: 2 });
        const employees = await Employee.find({ role: 3 });

        // Fetch list of teams
        const teams = await Team.find();

        // Render the EJS template with the fetched data
        res.render('teams', { admins, employees, teams });

    } catch (error) {
        console.log(error.message)
    }
}

const loadCreateTeam = async (req,res) => {
    try {
        
        const token = req.cookies.EMS_Token;
        if (!token) {
            res.render('unauthorizedError', {message: "You are Unauthorized"});
        }
        const employeeId = decodeToken(token);
        const employeeData = await Employee.findById({ _id: employeeId });
        const teamID = employeeData.teamID;


        // Fetch admins and employees from the database
        const admins = await Employee.find({ role: 2 }); // Assuming role 2 is for admins
        const employees = await Employee.find({ role: 3 }); // Assuming role 3 is for employees

        // Render the EJS template with the fetched data
        res.render('create-team', { admins, employees, user: employeeData});

    } catch (error) {
        console.log(error.message);
    }
}

const createTeam = async (req,res) => {
    try {
        const { teamName, projectManagerId, memberIds } = req.body;


        // Check if the team name is unique
        const existingTeam = await Team.findOne({ name: teamName });
        if (existingTeam) {
            return res.render('create-team', { message: 'Team name already exists' });
        }

        // Create the team
        const newTeam = await Team.create({
            name: teamName,
            projectManager: projectManagerId,
            members: memberIds
        });

        await newTeam.save();

        // Update the employee documents to reference the team
        await Employee.updateMany(
            { _id: { $in: [projectManagerId, ...memberIds] } },
            { $set: { teamID: newTeam._id, teamName: teamName } }
        );

        res.redirect('/superAdmin/dashboard'); // Redirect to admin dashboard

    } catch (error) {
        console.log(error.message);
    }
}

const deleteTeam = async (req,res) => {
    try {


        const teamId = req.params.teamId;

        // Find the team by ID
        const team = await Team.findById(teamId);

        // if (!team) {
        //     return res.status(404).send('Team not found');
        // }

        // Update employees' team information
        await Employee.updateMany(
            { _id: { $in: [...team.members, team.projectManager] } },
            { $set: { teamID: '', teamName: '' } }
        );

        // Delete the team
        await Team.findByIdAndDelete(teamId);



        res.redirect('/superAdmin/dashboard'); // Redirect to admin dashboard





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
    loadSendMail,
    sendMail,
    logout,
    deleteEmploy,
    loadTeams,
    loadCreateTeam,
    createTeam,
    deleteTeam
    
}