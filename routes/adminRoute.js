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



// import Admin Controller
const adminController = require('../controllers/adminController');

// Register Route
adminRoute.get('/register', adminController.loadRegister);
adminRoute.post('/register', upload.single('image'), employeeValidation.registerValidation, adminController.insertEmployee);


// Forget password
adminRoute.get('/forgetPassword', adminController.loadForgetPassword);
adminRoute.post('/forgetPassword', adminController.resetPassword);
adminRoute.get('/forget-password', adminController.resetPasswordLoad);
adminRoute.post('/forget-password', adminController.verifyresetPassword);


// Dashboard Route
adminRoute.get('/dashboard', auth, adminController.loadDashboard);
adminRoute.get('/editProfile', auth, adminController.editProfileLoad);
adminRoute.post('/editProfile', upload.single('image'), adminController.updateProfile );


// Employee Route
adminRoute.get('/employsList', auth, adminController.loadEmploysList);


// Update Employe Route
adminRoute.get('/edit-employ', adminController.loadEditEmploy);
adminRoute.post('/edit-employ', adminController.updateEmployProfile);

// Send Mail Route
adminRoute.get('/sendMail', adminController.loadSendMail);
adminRoute.post('/sendMail', adminController.sendMail);

// Logout Route
adminRoute.get('/logout', auth, adminController.logout);

// Delete Employ Route
adminRoute.get('/delete-employ', adminController.deleteEmploy);

// team creation
adminRoute.get('/team', adminController.loadTeam);
adminRoute.post('/team', adminController.insertTeamDetails);


// Team Route
adminRoute.get('/create-team', adminController.loadCreateTeam);
adminRoute.post('/create-team', adminController.createTeam);
adminRoute.get('/createTeam/:id', adminController.assignTeam);










adminRoute.get('*', (req,res) => {
    res.redirect('/superAdmin/dashboard');
});


module.exports = adminRoute;