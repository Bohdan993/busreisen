require('dotenv').config();
const sequelize = require('./db');
const {start: apiStart} = require('./api');


async function start(){
    try {
        // const [results, metadata] = await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
        await sequelize.authenticate();
        // await sequelize.sync({force: true});
        await sequelize.sync();
        // const [results1, metadata1] = await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
        await apiStart();
        
    } catch(err){
        console.error(err);
    }
}


start();