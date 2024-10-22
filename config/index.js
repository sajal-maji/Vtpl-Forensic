require("dotenv").config();

const envVars = process.env;
module.exports = {
  // env: envVars.ENVIRONMENT,
  // port: envVars.PORT,
  // sessionSecret: envVars.SESSION_SECRET,
  // sessionExpirationDays: envVars.SESSION_EXPIRATION_DAYS,
  // jwtSecret: envVars.JWT_SECRET,
  // jwtExpirationDays: envVars.JWT_EXPIRATION_DAYS,
  // dbHost: process.env.DB_HOST,
  // dbPort: process.env.DB_PORT,
  // dbName: process.env.DB_NAME,
  // dbUser: process.env.DB_USER,
  // dbPassword: process.env.DB_PASSWORD,
  // baseUrl: process.env.BASE_URL,  
  keepLogDays: envVars.KEEP_LOG_DAYS,
  
};
