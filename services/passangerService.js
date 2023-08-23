const { Op } = require("sequelize");
const validate = require("validate.js");
const Discount = require("../models/discount");
const DiscountAttributes = require("../models/discountAttributes");
const { isEmptyObject } = require("../helpers");
const { mapDiscounts } = require("./discountService");
const constants = require("../helpers/constants");

async function validatePassangersData(data){
    const dataToValidate = Object.values(data).reduce((acc, curr) => acc = {...acc, ...curr} , {});
    const constraints = await createValidateConstraints(data, dataToValidate);
    const errors = validate(dataToValidate, constraints) || {};

    if(!isEmptyObject(errors)) {
        return {status: "error", data: errors}
    }

    return {status: "ok", data: data}
};

async function createValidateConstraints(data, dataToValidate){
    const additionalPhoneRegex = new RegExp("^phone-additional-[0-9]+");
    const phoneRegex = new RegExp("^phone-[0-9]+");
    const nameRegex = new RegExp("^name-[0-9]+");
    const lastNameRegex = new RegExp("^last-name-[0-9]+");
    const emailRegex = new RegExp("^email-[0-9]+");
    const discountRegex = new RegExp("^discount-[0-9]+");
    const dateOfBirthRegex = new RegExp("^date-of-birth-[0-9]+");
    const constraints = {};

    let discounts = await Discount.findAll({
        attributes: ["id"],
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

    for(let passangerType in data) {
        //Get passanger type: adult or child
        const type = passangerType.match(/.+?(?=-)/)[0];
        const defaultDiscountId = "0";
        const bothDiscountIds = discounts.filter(el => el[0] === constants.BOTH)[0]?.[1].map(el => String(el?.id));
        const discountIds = type === constants.ADULT ? discounts.filter(el => el[0] === constants.ADULTS)[0]?.[1].map(el => String(el?.id))
        .concat(defaultDiscountId, bothDiscountIds) : 
        discounts.filter(el => el[0] === constants.CHILDREN)[0]?.[1].map(el => String(el?.id))
        .concat(defaultDiscountId, bothDiscountIds);

        for(let key in data[passangerType]) {
            
            if(additionalPhoneRegex.test(key)) {
                constraints[key] = {
                    format: {
                        pattern: /^\+380([5-9][0-9]\d{7})$|^\+49(\d{10,11})$/,
                        message: "^Некоректний номер телефону"
                    },
                    numericality: {
                        onlyInteger: true,
                        notInteger: "^Має містити лише цифри"
                    }
                };
            }

            if(phoneRegex.test(key)) {
                constraints[key] = {
                    presence: {
                        allowEmpty: false,
                        message: "^Заповніть це поле"
                    },
                    format: {
                        pattern: /^\+380([5-9][0-9]\d{7})$|^\+49(\d{10,11})$/,
                        message: "^Некоректний номер телефону"
                    },
                    numericality: {
                        onlyInteger: true,
                        notInteger: "^Має містити лише цифри"
                    },
                    exclusion: {
                        within: Object.entries(dataToValidate)
                            .filter(([k, _]) => (phoneRegex.test(k) && Number(k.replace(/^\D+/gm, '')) < Number(key.replace(/^\D+/gm, ''))))
                            .map(el => el?.[1]),
                        message: "^Ви вже використали цей номер телефону для іншого пасажира"
                    }
                };
            }

            if(nameRegex.test(key)) {
                constraints[key] = {
                    presence: {
                        allowEmpty: false,
                        message: "^Заповніть це поле"
                    },
                    format: {
                        pattern: /^[\u0400-\u04FF]+|[a-zA-ZäöüßÄÖÜẞ]+$/,
                        message: "^Має містити лише літери"
                    },
                    length: {
                        minimum: 3,
                        tooShort: "^Має містити мінімум %{count} літери",
                    }
                };
            }

            if(lastNameRegex.test(key)) {
                constraints[key] = {
                    presence: {
                        allowEmpty: false,
                        message: "^Заповніть це поле"
                    },
                    format: {
                        pattern: /^[\u0400-\u04FF]+|[a-zA-ZäöüßÄÖÜẞ]+$/,
                        message: "^Має містити лише літери"
                    },
                    length: {
                        minimum: 2,
                        tooShort: "^Має містити мінімум %{count} літери",
                    }
                };
            }

            if(emailRegex.test(key)) {
                constraints[key] = {
                    presence: {
                        allowEmpty: false,
                        message: "^Заповніть це поле"
                    },
                    email: {
                        message: "^Некоректний email",
                    }
                };
            }

            if(discountRegex.test(key)){
                constraints[key] = {
                    numericality: {
                        onlyInteger: true,
                        notInteger: "^Некоректна знижка"
                    },
                    inclusion: {
                        within: discountIds,
                        message: "^Некоректна знижка"
                    }
                };
            }

            if(dateOfBirthRegex.test(key)) {
                constraints[key] = {
                    presence: {
                        allowEmpty: false,
                        message: "^Заповніть це поле"
                    },
                    datetime: {
                        dateOnly: true,
                        message: "^Некоректна дата"
                    }
                };
            }
        }
    }

    return constraints;
};

module.exports = {
    validatePassangersData
}