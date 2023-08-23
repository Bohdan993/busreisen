const crypto = require("crypto");

const { Op } = require("sequelize");
const Discount = require("../models/discount");
const DiscountAttributes = require("../models/discountAttributes");
const BusFlightPrices = require("../models/busFlightPrices");
const CurrencyModel = require("../models/currency");
const { mapDiscounts, filterByDateDiscounts } = require("./discountService");


function strToSign (str) {
    const sha1 = crypto.createHash("sha1");
    sha1.update(str);
    return sha1.digest("base64");
};

async function calculatePrice(data, currencyAbbr, originId, destinationId, isOneWay = null) {
    const passangersData = Object.entries(data || []);
    let currency = await CurrencyModel.findOne({
        attributes: ["id", "name", "abbr", "symbol"],
        where: {
            abbr: {
                [Op.eq]: currencyAbbr
            }
        }
    });

    let discounts = await Discount.findAll({
        attributes: ["id", "coef", "inactivePeriod"],
        order: [
            ["id", "ASC"],
        ],
        include: [
            {
                model: DiscountAttributes,
                attributes: ["group"],
                where: {
                    languageId: {
                        [Op.eq]: 1
                    }
                }
            }
        ],
    });

    discounts = discounts?.map(discount => discount?.toJSON());
    discounts = mapDiscounts(discounts);
    discounts = filterByDateDiscounts(discounts);

    let price = await BusFlightPrices.findOne({
        attributes: ["priceOneWay", "priceRoundTrip", "currencyId"],
        where: {
            [Op.and]: [
                {firstCityId: originId},
                {secondCityId: destinationId},
                {currencyId: currency?.id}
            ]
        }
    });

    if(isOneWay) {
        price = price?.priceOneWay;
    } else {
        price = price?.priceRoundTrip;
    }


    const calculatedPrice = passangersData.reduce(priceReducer, 0);

    function priceReducer (acc, curr) {
        const discountRegex = new RegExp("^discount-[0-9]+");
        let discountId;
        const currData = curr[1];
        for(let key in currData) {
            if(discountRegex.test(key)) {
                discountId = currData[key];
            }
        }
        const discountCoef = discounts?.filter(item => item?.[1]?.find(el => String(el?.id) === String(discountId)))
        ?.[0]?.[1]
        ?.find(el => String(el?.id) === String(discountId))?.coef;

        const calcPrice = Number(price) * (1 - Number(discountCoef || 0));
        return acc+= calcPrice;
    }

    return calculatedPrice;
};

module.exports = {
    calculatePrice,
    strToSign
}