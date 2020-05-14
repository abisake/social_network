const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI'); //

const connectDB = async () => {
    try {
        await mongoose.connect(db)

        console.log("MongoDB connection is successful ")
    } catch (err) {
        console.log(err.message)
        process.exit(1) //here application will failed and exit
    }
}

module.exports = connectDB