require('dotenv').config({ path: `.env.${process.env.NODE_ENV}.local` });
const {start: apiStart} = require('./api');


async function start(){
    try {
        await apiStart();
        
    } catch(err){
        console.error(err);
    }
}


start();