const fs = require("fs");
const moment = require('moment');

const logCreate = async function (msg, logfile = 'systemlog.text') {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');

    const logFileName = `${logfile}_${year}-${month}-${day}.txt`;

    let ccavnueResponceStream = fs.createWriteStream("public/logs/" + logFileName, { flags: "a" });
    const message = `${moment(new Date()).format('YYYY-MM-DDTHH:mm:ss')} : ${msg}\n`;
    ccavnueResponceStream.write(message, (error) => {
        if (error) {
            console.error('Error writing log:', error);
        } else {
            console.log('Log written successfully.');
        }
    });
};

module.exports = {
    logCreate
}