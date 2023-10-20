const { Op } = require("sequelize");
const validate = require("validate.js");
const DiscountModel = require("../models/discount");
const DiscountAttributesModel = require("../models/discountAttributes");
const { isEmptyObject } = require("../helpers");
const { mapDiscounts, filterByDateDiscounts } = require("./discountService");
const constants = require("../helpers/constants");


async function transformPassangersData(data, price, languageId){

    const passangersData = Object.entries(data || []);

    let discounts = await DiscountModel.findAll({
        attributes: ["id", "coef", "inactivePeriod"],
        order: [
            ["id", "ASC"],
        ],
        include: [
            {
                model: DiscountAttributesModel,
                attributes: ["group", "name"],
                where: {
                    languageId: {
                        [Op.eq]: languageId
                    },
                    group: {
                        [Op.not]: constants.BUS_FLIGHT
                    }
                }
            }
        ],
    });

    discounts = discounts?.map(discount => discount?.toJSON());
    discounts = mapDiscounts(discounts);
    discounts = filterByDateDiscounts(discounts);

    const discountRegex = new RegExp("^discount-[0-9]+");
    const transformedData = passangersData
                            .map(passangerMapper)
                            .reduce(passangerReducer, {});

    function passangerMapper (el) {
            let discountId;
            let currPassangerCount = el[0].replace(/\D+/, "");

            for(let key in el[1]) {
                if(discountRegex.test(key)) {
                    discountId = el[1][key];
                }
            }

            
            const currDiscount = discounts?.filter(item => item?.[1]?.find(el => String(el?.id) === String(discountId)))
            ?.[0]?.[1]
            ?.find(el => String(el?.id) === String(discountId));
            const discountCoef = currDiscount?.coef;
            const discountName = currDiscount?.DiscountAttributes?.[0]?.name;

            const calcPrice = Math.round(parseInt(price) * (1 - Number(discountCoef || 0)));
            const newObj = {
                ...el[1],
                [`full-ticket-price-${currPassangerCount}`]: parseInt(price),
                [`discount-ticket-price-${currPassangerCount}`]: calcPrice,
                [`discount-percantage-${currPassangerCount}`]: (discountCoef || 0) * 100,
                [`discount-name-${currPassangerCount}`]: discountName
            };

            return [el[0], {
                ...newObj
            }];
    }

    function passangerReducer(acc, curr) {
        if(!acc[curr[0]] ) {
            acc[curr[0]] = curr[1];
        }

        return acc;
    }

    return transformedData;
}

async function validatePassangersData(data, translations){
    const dataToValidate = Object.values(data).reduce((acc, curr) => acc = {...acc, ...curr} , {});
    const constraints = await createValidateConstraints(data, dataToValidate, translations);
    const errors = validate(dataToValidate, constraints) || {};

    if(!isEmptyObject(errors)) {
        return {status: "error", data: errors}
    }

    return {status: "ok", data: data}
};

async function createValidateConstraints(data, dataToValidate, translations){
    const additionalPhoneRegex = new RegExp("^phone-additional-[0-9]+");
    const phoneRegex = new RegExp("^phone-[0-9]+");
    const nameRegex = new RegExp("^name-[0-9]+");
    const lastNameRegex = new RegExp("^last-name-[0-9]+");
    const emailRegex = new RegExp("^email-[0-9]+");
    const discountRegex = new RegExp("^discount-[0-9]+");
    const dateOfBirthRegex = new RegExp("^date-of-birth-[0-9]+");
    const cardDiscountRegex = new RegExp("^card-discount-[0-9]+");
    const constraints = {};

    let discounts = await DiscountModel.findAll({
        attributes: ["id"],
        order: [
            ["id", "ASC"],
        ],
        include: [
            {
                model: DiscountAttributesModel,
                attributes: ["group"],
                where: {
                    languageId: {
                        [Op.eq]: 1
                    },
                    group: {
                        [Op.not]: constants.BUS_FLIGHT
                    }
                }
            }
        ],

    });

    discounts = discounts?.map(discount => discount?.toJSON());
    discounts = mapDiscounts(discounts);

    for(let passangerType in data) {
        //Get passanger type: adult or child
        const type = passangerType.match(/.+?(?=-)/)[0];
        const defaultDiscountId = "0";
        const bothDiscountIds = discounts.filter(el => el[0] === constants.BOTH)[0]?.[1].map(el => String(el?.id));
        const discountCardsIds = discounts.filter(el => el[0] === constants.DISCOUNT_CARD)[0]?.[1].map(el => String(el?.id));
        const discountIds = type === constants.ADULT ? discounts.filter(el => el[0] === constants.ADULTS)[0]?.[1].map(el => String(el?.id))
        .concat(defaultDiscountId, discountCardsIds, bothDiscountIds) : 
        discounts.filter(el => el[0] === constants.CHILDREN)[0]?.[1].map(el => String(el?.id))
        .concat(defaultDiscountId, bothDiscountIds);

        for(let key in data[passangerType]) {
            
            if(additionalPhoneRegex.test(key) && dataToValidate[key] !== "") {
                constraints[key] = {
                    format: {
                        pattern: /^\+380([5-9][0-9]\d{7})$|^\+49(\d{10,11})$/,
                        message: translations?.validationErrors?.["1"]
                    },
                    numericality: {
                        onlyInteger: true,
                        notInteger: translations?.validationErrors?.["2"]
                    }
                };
            }

            if(phoneRegex.test(key)) {
                constraints[key] = {
                    presence: {
                        allowEmpty: false,
                        message: translations?.validationErrors?.["3"]
                    },
                    format: {
                        pattern: /^\+380([5-9][0-9]\d{7})$|^\+49(\d{10,11})$/,
                        message: translations?.validationErrors?.["1"]
                    },
                    numericality: {
                        onlyInteger: true,
                        notInteger: translations?.validationErrors?.["2"]
                    },
                    exclusion: {
                        within: Object.entries(dataToValidate)
                            .filter(([k, _]) => (phoneRegex.test(k) && Number(k.replace(/^\D+/gm, '')) < Number(key.replace(/^\D+/gm, ''))))
                            .map(el => el?.[1]),
                        message: translations?.validationErrors?.["4"]
                    }
                };
            }

            if(nameRegex.test(key)) {
                constraints[key] = {
                    presence: {
                        allowEmpty: false,
                        message: translations?.validationErrors?.["3"]
                    },
                    format: {
                        pattern: /^[\u0400-\u04FF-]+|[a-zA-ZäöüßÄÖÜẞ-]+$/,
                        message: translations?.validationErrors?.["5"]
                    },
                    length: {
                        minimum: 3,
                        tooShort: translations?.validationErrors?.["6"]
                    }
                };
            }

            if(lastNameRegex.test(key)) {
                constraints[key] = {
                    presence: {
                        allowEmpty: false,
                        message: translations?.validationErrors?.["3"]
                    },
                    format: {
                        pattern: /^[\u0400-\u04FF-]+|[a-zA-ZäöüßÄÖÜẞ-]+$/,
                        message: translations?.validationErrors?.["5"]
                    },
                    length: {
                        minimum: 2,
                        tooShort: translations?.validationErrors?.["6"]
                    }
                };
            }

            if(emailRegex.test(key)) {
                constraints[key] = {
                    presence: {
                        allowEmpty: false,
                        message: translations?.validationErrors?.["3"]
                    },
                    email: {
                        message: translations?.validationErrors?.["7"]
                    }
                };
            }

            if(discountRegex.test(key)){
                constraints[key] = {
                    numericality: {
                        onlyInteger: true,
                        notInteger: translations?.validationErrors?.["8"]
                    },
                    inclusion: {
                        within: discountIds,
                        message: translations?.validationErrors?.["8"]
                    }
                };
            }

            if(cardDiscountRegex.test(key)){
                constraints[key] = {
                    presence: {
                        allowEmpty: false,
                        message: translations?.validationErrors?.["3"]
                    },
                    numericality: {
                        onlyInteger: true,
                        message: translations?.validationErrors?.["10"]
                    }
                };
            }

            if(dateOfBirthRegex.test(key)) {
                constraints[key] = {
                    presence: {
                        allowEmpty: false,
                        message: translations?.validationErrors?.["3"]
                    },
                    datetime: {
                        dateOnly: true,
                        message: translations?.validationErrors?.["9"]
                    }
                };
            }
        }
    }

    return constraints;
};

module.exports = {
    validatePassangersData,
    transformPassangersData
}