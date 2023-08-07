const jwt = require('jsonwebtoken');
const secret = 'employee_management_system';

const createToken = async (employeeData) => {
    try {
        
        const token = await jwt.sign({ _id: employeeData._id }, secret, { expiresIn: '10m' });
        return token;

    } catch (error) {
        console.log(error.message);
    }
}

const decodeToken = (token) => {
    try {
        const decoded = jwt.verify(token, secret);
        return decoded._id;
    } catch (error) {
        throw new Error('Invalid token');
    }
};


module.exports = {
    createToken,
    decodeToken
};