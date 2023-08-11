const express = require('express');
const employeeValidation = require('../middleware/employe_validation/userValidation');
const multer = require('multer');
const auth = require('../middleware/auth/auth');
const cookieParser = require('cookie-parser');

const superAdminRoute = express();

// Set View Engine
superAdminRoute.set('view engine', 'ejs');
superAdminRoute.set('views','./views/super-admin');

// Middleware
superAdminRoute.use(express.urlencoded({ extended: true }));
superAdminRoute.use(express.json());
superAdminRoute.use(cookieParser());


// Profile Picture Upload using Multer
const path = require("path");
superAdminRoute.use(express.static('public'));
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
const superAdminController = require('../controllers/superAdminController');

// Register Route
superAdminRoute.get('/register', superAdminController.loadRegister);
superAdminRoute.post('/register', upload.single('image'), employeeValidation.registerValidation, superAdminController.insertEmployee);

// // Forget password
// superAdminRoute.get('/forgetPassword', superAdminController.loadForgetPassword);
// superAdminRoute.post('/forgetPassword', superAdminController.resetPassword);
// superAdminRoute.get('/forget-password', superAdminController.resetPasswordLoad);
// superAdminRoute.post('/forget-password', superAdminController.verifyresetPassword);



// Dashboard Route
superAdminRoute.get('/dashboard', auth, superAdminController.loadDashboard);
superAdminRoute.get('/editProfile', auth, superAdminController.editProfileLoad);
superAdminRoute.post('/editProfile', upload.single('image'), superAdminController.updateProfile );

// OU Route
superAdminRoute.get('/organisationalUnit', auth, superAdminController.loadOU);
superAdminRoute.get('/adminsList', auth, superAdminController.loadAdminsList);
superAdminRoute.get('/employsList', auth, superAdminController.loadEmploysList);

// Update Employe Route
superAdminRoute.get('/edit-employ', superAdminController.loadEditEmploy);
superAdminRoute.post('/edit-employ', superAdminController.updateEmployProfile);

// Export Users 
superAdminRoute.get('/export-employs', superAdminController.exportEmploys);

// Send Mail Route
superAdminRoute.get('/sendMail', superAdminController.loadSendMail);
superAdminRoute.post('/sendMail', superAdminController.sendMail);

// Logout Route
superAdminRoute.get('/logout', auth, superAdminController.logout);

// Delete Employ Route
superAdminRoute.get('/delete-employ', superAdminController.deleteEmploy);

superAdminRoute.get('*', (req,res) => {
    res.redirect('/superAdmin/dashboard');
});



module.exports = superAdminRoute;