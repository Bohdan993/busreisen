const {
    Router
} = require("express");
const router = Router();
const Currency = require("../../models/currency");
const { Op } = require("sequelize");


router.get("/", async (req, res, next) => {
    try {

        const {
            currencyAbbr,
            fields = []
        } = req?.query;

        let currencies = [];

        currencies = await Currency.findAll({
            attributes: ["id", ...fields],
            where: {
                abbr: {
                    [Op.in]: String(currencyAbbr).split(",")
                }
            }

        });

        return res.json({status: "ok", data: currencies});

    } catch (err) {
        return next(err);
    }
    
});


module.exports = router