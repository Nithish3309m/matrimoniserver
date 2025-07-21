const mongoose = require('mongoose');
require('dotenv').config();

const database = mongoose.connect(process.env.DB_URL)
    .then(() => {
        console.log("DB connected");
    })
    .catch((err) => {
        console.log(err);
    })

module.exports = database;