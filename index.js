const express = require('express');
const connectDB = require('./db/database');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const app = express();
connectDB();


// this is for css config
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());


// Super Admin Route
const superAdminRoute = require('./routes/superAdminRoute');
app.use('/superAdmin', superAdminRoute);

// Admin Route
const adminRoute = require('./routes/adminRoute');
app.use('/admin', adminRoute);

// Employee Route
const employRoute = require('./routes/employeeRoute');
app.use('/',employRoute);


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
});