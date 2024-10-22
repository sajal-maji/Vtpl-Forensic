const log4js = require('log4js');
const config = require('.');

log4js.configure({
    appenders: {
        access: {
            type: 'dateFile',
            filename: 'logs/access/access',
            pattern: 'yyyy-MM-dd.log',
            compress: true,
            daysToKeep: 7,//config.keepLogDays,
            keepFileExt: true,
            alwaysIncludePattern: true,
        },
        error: {
            type: 'dateFile',
            filename: 'logs/error/error',
            pattern: 'yyyy-MM-dd.log',
            compress: true,
            daysToKeep: 7,//config.keepLogDays,
            keepFileExt: true,
            alwaysIncludePattern: true
        },
        console: {
            type: 'console'
        }
    },
    categories: {
        default: { appenders: ["console"], level: 'info' },
        access: { appenders: ["access"], level: 'info' },
        error: { appenders: ["error"], level: 'error' },
    },
    // levels: { levels: ['error']}
});

module.exports = {
    accessLogger: log4js.getLogger('access'),
    errorLogger: log4js.getLogger('error'),
    consoleLogger: log4js.getLogger('console'),
    log4js
};