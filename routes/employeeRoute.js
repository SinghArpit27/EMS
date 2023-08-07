const express = require('express');
const employeeValidation = require('../middleware/employe_validation/userValidation');
const multer = require('multer');
const auth = require('../middleware/auth/auth');
const cookieParser = require('cookie-parser');

const employRoute = express();

// Set View Engine
employRoute.set('view engine', 'ejs');
employRoute.set('views','./views/employee');

// Middleware
employRoute.use(express.urlencoded({ extended: true }));
employRoute.use(express.json());
employRoute.use(cookieParser());


// Image Upload using Multer
// profile photo
const path = require("path");
employRoute.use(express.static('public'));
const storage = multer.diskStorage({
    destination:function(req,file,cb){
            cb(null,path.join(__dirname, '../public/uploads/employeeImages'));
        },
        filename:function(req,file,cb){
            const name = Date.now()+'-'+file.originalname;
            cb(null,name);
        }

});
const upload = multer({storage:storage});



// import employeeController
const employeeController = require('../controllers/employeeController');

// Register Route
employRoute.get('/register', employeeController.loadRegister);
employRoute.post('/register', upload.single('image'), employeeValidation.registerValidation, employeeController.insertEmployee);

// Verify Employee Route
employRoute.get('/verify',employeeController.verifyMail);

// login Route
employRoute.get('/', employeeController.loginLoad);
employRoute.get('/login', employeeController.loginLoad);
employRoute.post('/login', employeeController.verifyLogin);

// Dashboard Route
employRoute.get('/dashboard', auth, employeeController.loadDashboard);
employRoute.get('/editProfile', auth, employeeController.editProfileLoad);
employRoute.post('/editProfile', upload.single('image'), employeeController.updateProfile );

// Employee Details Route
employRoute.get('/empDetails', auth, employeeController.loadEmpDetail);

// Logout Route
employRoute.get('/logout', auth, employeeController.logout)

// Errors Route
employRoute.get('/errorUna', employeeController.loadUnauthorizedError);

module.exports = employRoute;