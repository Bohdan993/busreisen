const {
    Router
} = require("express");
const { loadLanguageFile } = require("../../helpers");
const router = Router();
const path = require("path");
const fs = require("fs");


router.get("/", async (req, res, next) => {
    try {

        const {
            languageCode = "uk_UA",
            objects = []
        } = req?.query;

        console.log('Objects', objects);
        const p = path.resolve("languages", languageCode);
        const filesNames = [];
        const files = fs.readdirSync(p);

        files.forEach(file => {
            filesNames.push(file);
        });

        const result = objects.reduce((acc, curr) => {
            acc[curr] = loadLanguageFile(
                filesNames.find(el => new RegExp(`^${curr}-[a-z]+\.js`).test(el)), 
                languageCode
            );
            return acc;
        }, {});

        return res.json({status: "ok", data: result});

    } catch (err) {
        return next(err);
    }
    
});


module.exports = router