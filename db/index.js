const mongoose = require('mongoose');

const dbUri = process.env.DB_URI || '';
const dbName = process.env.DB_NAME || '';

const connectToDB = () => {
    mongoose.connect(`${dbUri}/${dbName}`)
    .then(() => {
        console.info('Successfully connected to mongodb.');
    })
    .catch((err) => {
        console.info('Failed to connect with mongodb. Error: ', err.message)
    })
}

module.exports = connectToDB;