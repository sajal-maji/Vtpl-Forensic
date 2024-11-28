const httpStatus = require('http-status');
const { errorLogger, consoleLogger } = require('../config/log.config');

const handleError = (err, req, res, next) => {
    const statusCode = err.code || 500;
    const status = err.status || 'Internal Server Error';
    const errorMessage = err.message;
    consoleLogger.info(errorMessage, status)

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            statusCode: 401,
            success: false,
            message: "The JWT token has expired. Please log in again.",
        });
    }

    if (statusCode == 500){
        const logMessage = `${req.ip} - "${req.method} ${req.url} HTTP/${req.httpVersion}" ${status} - "${req.headers['referrer'] || req.headers['referer']}" "${req.headers['user-agent']}" - Error: ${errorMessage}`;
        errorLogger.error(logMessage);
        return  res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
            statusCode,
            success: false, 
            message: errorMessage
        })
    } else {
        res.status(statusCode).json({
            statusCode,
            status,
            message: errorMessage,
            success: false,
        })
    }
}

module.exports = handleError;

// const httpStatus = require('http-status');
// const { errorLogger, consoleLogger } = require('../config/log.config');

// const handleError = (error, req, res, next) => {
//     const status = error.status || 500;
//     const message = error.message;
//     consoleLogger.info(message, status)
    
//     if (status == 500){
//         // log error
//         const logMessage = `${req.ip} - "${req.method} ${req.url} HTTP/${req.httpVersion}" ${status} - "${req.headers['referrer'] || req.headers['referer']}" "${req.headers['user-agent']}" - Error: ${message}`;
//         errorLogger.error(logMessage);
//         return  res.status(httpStatus.INTERNAL_SERVER_ERROR).send({success: false, message: 'Something went wrong'})
//     } else {
//         return res.status(status).json({success: false, message: message})
//     }
// }

// module.exports = handleError;