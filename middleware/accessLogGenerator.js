const { accessLogger, log4js } = require('../config/log.config');

const accessLogGenerator = log4js.connectLogger(accessLogger, {
        level: 'info',
        format: (req, res, format) => format(`:remote-addr - ":method :url HTTP/:http-version" :status :content-length ":referrer" ":user-agent"`)
      })

module.exports = accessLogGenerator;