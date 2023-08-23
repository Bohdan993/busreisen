const Sequelize = require("sequelize");


const settings = process.env.DB_DIALECT === "mysql" ? 
{
  main: [process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS],
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT
} :
 
{
  main: [process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS],
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  dialectOptions: {
    ssl: process.env.DB_SSL
  }
}

const sequelize = process.env.DB_DIALECT === "mysql" ? new Sequelize(
  ...settings.main,
  {
    host: settings.host,
    dialect: settings.dialect
  }
) 
: 
new Sequelize(
  ...settings.main,
  {
    host: settings.host,
    dialect: settings.dialect,
    dialectOptions: settings.dialectOptions
  }
);

module.exports = sequelize;