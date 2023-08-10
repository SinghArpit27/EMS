const express = require('express');
const employeeValidation = require('../middleware/employe_validation/userValidation');
const multer = require('multer');
const auth = require('../middleware/auth/auth');
const cookieParser = require('cookie-parser');

const adminRoute = express();

// Set View Engine
adminRoute.set('view engine', 'ejs');
adminRoute.set('views','./views/admin');

// Middleware
adminRoute.use(express.urlencoded({ extended: true }));
adminRoute.use(express.json());
adminRoute.use(cookieParser());


// Profile Picture Upload using Multer
const path = require("path");
adminRoute.use(express.static('public'));
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
const adminController = require('../controllers/adminController');
// Register Route
// superAdminRoute.get('/register', superAdminController.loadRegister);
// superAdminRoute.post('/register', upload.single('image'), employeeValidation.registerValidation, superAdminController.insertEmployee);


// // Forget password
// superAdminRoute.get('/forgetPassword', superAdminController.loadForgetPassword);
// superAdminRoute.post('/forgetPassword', superAdminController.resetPassword);
// superAdminRoute.get('/forget-password', superAdminController.resetPasswordLoad);
// superAdminRoute.post('/forget-password', superAdminController.verifyresetPassword);


// // Dashboard Route
// superAdminRoute.get('/dashboard', auth, superAdminController.loadDashboard);
// superAdminRoute.get('/editProfile', auth, superAdminController.editProfileLoad);
// superAdminRoute.post('/editProfile', upload.single('image'), superAdminController.updateProfile );

// // OU Route
// superAdminRoute.get('/organisationalUnit', auth, superAdminController.loadOU);
// superAdminRoute.get('/adminsList', auth, superAdminController.loadAdminsList);
// superAdminRoute.get('/employsList', auth, superAdminController.loadEmploysList);


module.exports = adminRoute;