require('dotenv').config();

const config = {
  "development": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASS,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": process.env.DB_DIALECT,
    // Use a different storage. Default: none
    "seederStorage": "sequelize"
  },
  "test": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASS,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": process.env.DB_DIALECT,
    "seederStorage": "sequelize"
  },
  "production": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASS,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": process.env.DB_DIALECT,
    "seederStorage": "sequelize"
  }
}

if(process.env.DB_DIALECT === "postgres") {
  config.development.dialectOptions = {};
  config.development.dialectOptions.ssl = process.env.DB_SSL;

  config.test.dialectOptions = {};
  config.test.dialectOptions.ssl = process.env.DB_SSL;

  config.production.dialectOptions = {};
  config.production.dialectOptions.ssl = process.env.DB_SSL;
}

module.exports = config;