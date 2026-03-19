const mongoose = require('mongoose');

const dbUri = process.env.DB_URI || '';
const dbName = process.env.DB_NAME || '';

const Setting = require("../model/setting.model");

const createDefaultSetting = async () => {
    try {
        const exists = await Setting.findOne();

        if (!exists) {
            await Setting.create({
                undoVideoLimit: 3,
                undoImageLimit: 8
            });

            console.log("✅ Default setting created");
        } else {
            console.log("ℹ️ Setting already exists");
        }

    } catch (err) {
        console.error("❌ Error creating default setting:", err);
    }
};


const connectToDB = () => {
    mongoose.connect(`${dbUri}/${dbName}`)
    .then(async () => {
        await createDefaultSetting();
        console.info('Successfully connected to mongodb.');
    })
    .catch((err) => {
        console.info('Failed to connect with mongodb. Error: ', err.message)
    })
}

module.exports = connectToDB;