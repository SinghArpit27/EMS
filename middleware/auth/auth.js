const jwt = require('jsonwebtoken');
const Employee = require('../../models/employeeSchema');
const { createToken, decodeToken } = require('../../util/feature');


const auth = async (req,res,next) => {
    try {
        
        const token = req.cookies.EMS_Token;
        if (!token) {
            res.render('unauthorizedError', {message: "You are Unauthorized"});
        }
        const employeeId = decodeToken(token);
        // const employeeData = await Employee.findById({ _id: employeeId });
        next();

        // req.token = token;
        // req.employee = employeeData;

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = auth;