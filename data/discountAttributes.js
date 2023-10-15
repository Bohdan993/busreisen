const constants = require("../helpers/constants");

const discountAttributesUK = [
    {
        "name": "Дітям від 0 до 1 року - 50 %.",
        "discountId": 1,
        "languageId": 1,
        "group": constants.CHILDREN

    },
    {
        "name": "Дітям від 1 до 4 років - 30 %.",
        "discountId": 2,
        "languageId": 1,
        "group": constants.CHILDREN

    },
    {
        "name": "Дітям від 5 до 11 років - 20 %.",
        "discountId": 3,
        "languageId": 1,
        "group": constants.CHILDREN

    },
    {
        "name": "Дітям від 12 до 15 років - 10 %.",
        "discountId": 4,
        "languageId": 1,
        "group": constants.CHILDREN

    },
    {
        "name": "Студентам (при наявності посвідчення) - 10 %. (Знижка в період з 15 червня по 15 серпня не діє).",
        "discountId": 5,
        "languageId": 1,
        "group": constants.ADULTS

    },
    {
        "name": "Військовим (при наявності посвідчення) - 10 %.",
        "discountId": 6,
        "languageId": 1,
        "group": constants.ADULTS

    },
    {
        "name": "Пенсіонерам старше 60 років (при наявності посвідчення) - 10 %.",
        "discountId": 7,
        "languageId": 1,
        "group": constants.ADULTS

    },
    {
        "name": "Інвалідам 1 і 2 групи (при наявності посвідчення) - 10 %.",
        "discountId": 8,
        "languageId": 1,
        "group": constants.ADULTS

    },
    {
        "name": "Групам (від 10 осіб) - 10 %.",
        "discountId": 9,
        "languageId": 1,
        "group": constants.BOTH

    },
    {
        "name": "Картка постійного клієнта - 10%.",
        "discountId": 10,
        "languageId": 1,
        "group": constants.DISCOUNT_CARD

    },
    {
        "name": "Картка постійного клієнта - 15%.",
        "discountId": 11,
        "languageId": 1,
        "group": constants.DISCOUNT_CARD
    },
    {
        "name": "Знижка на рейс",
        "discountId": 12,
        "languageId": 1,
        "group": constants.BUS_FLIGHT
    }
];

const discountAttributesRU = [
    {
        "name": "Детям от 0 до 1 года - 50 %.",
        "discountId": 1,
        "languageId": 1,
        "group": constants.CHILDREN

    },
    {
        "name": "Детям от 1 до 4 лет - 30 %.",
        "discountId": 2,
        "languageId": 1,
        "group": constants.CHILDREN

    },
    {
        "name": "Детям от 5 до 11 лет - 20 %.",
        "discountId": 3,
        "languageId": 1,
        "group": constants.CHILDREN

    },
    {
        "name": "Детям от 12 до 15 лет - 10 %.",
        "discountId": 4,
        "languageId": 1,
        "group": constants.CHILDREN

    },
    {
        "name": "Студентам (при наличии удостоверения) – 10 %. (Скидка в период с 15 июня по 15 августа не действует).",
        "discountId": 5,
        "languageId": 1,
        "group": constants.ADULTS

    },
    {
        "name": "Военным (при наличии удостоверения) – 10 %.",
        "discountId": 6,
        "languageId": 1,
        "group": constants.ADULTS

    },
    {
        "name": "Пенсионерам старше 60 лет (при наличии удостоверения) – 10%.",
        "discountId": 7,
        "languageId": 1,
        "group": constants.ADULTS

    },
    {
        "name": "Инвалидам 1 и 2 группы (при наличии удостоверения) – 10 %.",
        "discountId": 8,
        "languageId": 1,
        "group": constants.ADULTS

    },
    {
        "name": "Группам (от 10 человек) – 10%.",
        "discountId": 9,
        "languageId": 1,
        "group": constants.BOTH

    },
    {
        "name": "Карточка постоянного клиента – 10%.",
        "discountId": 10,
        "languageId": 1,
        "group": constants.DISCOUNT_CARD

    },
    {
        "name": "Карточка постоянного клиента – 15%.",
        "discountId": 11,
        "languageId": 1,
        "group": constants.DISCOUNT_CARD
    },
    {
        "name": "Скидка на рейс",
        "discountId": 12,
        "languageId": 1,
        "group": constants.BUS_FLIGHT
    }
];

const discountAttributesDE = [
    {
        "name": "Kinder von 0 bis 1 Jahr - 50 %.",
        "discountId": 1,
        "languageId": 1,
        "group": constants.CHILDREN

    },
    {
        "name": "Kinder von 1 bis 4 Jahren - 30 %.",
        "discountId": 2,
        "languageId": 1,
        "group": constants.CHILDREN

    },
    {
        "name": "Kinder von 5 bis 11 Jahren - 20 %.",
        "discountId": 3,
        "languageId": 1,
        "group": constants.CHILDREN

    },
    {
        "name": "Kinder von 12 bis 15 Jahren - 10 %.",
        "discountId": 4,
        "languageId": 1,
        "group": constants.CHILDREN

    },
    {
        "name": "Studierende (sofern sie über ein Zertifikat verfügen) – 10 %. (Der Rabatt gilt nicht vom 15. Juni bis 15. August).",
        "discountId": 5,
        "languageId": 1,
        "group": constants.ADULTS

    },
    {
        "name": "Militär (sofern ein Zertifikat vorliegt) – 10 %.",
        "discountId": 6,
        "languageId": 1,
        "group": constants.ADULTS

    },
    {
        "name": "Rentner über 60 Jahre (sofern sie über eine Bescheinigung verfügen) – 10 %.",
        "discountId": 7,
        "languageId": 1,
        "group": constants.ADULTS

    },
    {
        "name": "Behinderte der Gruppen 1 und 2 (sofern sie über ein Zertifikat verfügen) – 10 %.",
        "discountId": 8,
        "languageId": 1,
        "group": constants.ADULTS

    },
    {
        "name": "Gruppen (ab 10 Personen) – 10 %.",
        "discountId": 9,
        "languageId": 1,
        "group": constants.BOTH

    },
    {
        "name": "Treuekundenkarte – 10 %.",
        "discountId": 10,
        "languageId": 1,
        "group": constants.DISCOUNT_CARD

    },
    {
        "name": "Treuekundenkarte – 15 %.",
        "discountId": 11,
        "languageId": 1,
        "group": constants.DISCOUNT_CARD
    },
    {
        "name": "Flugrabatt",
        "discountId": 12,
        "languageId": 1,
        "group": constants.BUS_FLIGHT
    }
];
module.exports = [...discountAttributesUK, ...discountAttributesRU, ...discountAttributesDE];