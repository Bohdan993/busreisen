const {
    Router
} = require("express");
const { loadLanguageFile } = require("../../helpers");
const router = Router();
const path = require("path");
const fs = require("fs");


router.get("/", async (req, res) => {
    // console.log("SESS ID", req.session.id);
    try {

        const {
            languageCode = "uk_UA",
            objects = []
        } = req?.query;

        const p = path.resolve("languages", languageCode);
        const filesNames = [];
        const files = fs.readdirSync(p);

        files.forEach(file => {
            filesNames.push(file);
        });

        const result = objects.reduce((acc, curr) => {
            acc[curr] = loadLanguageFile(filesNames.find(el => new RegExp(`^${curr}-[a-z]+\.js`).test(el)), languageCode);
            return acc;
        }, {});

        return res.json({status: "ok", data: result});

    } catch (err) {
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
    
});


module.exports = router