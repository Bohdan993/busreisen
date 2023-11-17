require('dotenv').config();
const {start: apiStart} = require('./api');


async function start(){
    try {
        await apiStart();
        
    } catch(err){
        console.error(err);
    }
}


start();