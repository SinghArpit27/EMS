const mongoose = require('mongoose');

const connectDB = () => {
    mongoose.connect('mongodb://127.0.0.1:27017', {
        dbName: "EMS"
    })
    .then(() => console.log("DB Connected"))
    .catch((err) => console.log(err));
}

module.exports = connectDB;