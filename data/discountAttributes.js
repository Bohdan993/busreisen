const constants = require("../helpers/constants");

const discountAttributesUK = [
    {
        "name": "Дитина від 0 до 1 року - 50 %.",
        "discountId": 1,
        "languageId": 1,
        "group": constants.CHILDREN

    },
    {
        "name": "Дитина від 1 до 4 років - 30 %",
        "discountId": 2,
        "languageId": 1,
        "group": constants.CHILDREN

    },
    {
        "name": "Дитина від 5 до 11 років - 20 %.",
        "discountId": 3,
        "languageId": 1,
        "group": constants.CHILDREN

    },
    {
        "name": "Дитина від 12 до 15 років - 10 %.",
        "discountId": 4,
        "languageId": 1,
        "group": constants.CHILDREN

    },
    {
        "name": "Студент - 10 % (знижка в період з 15 червня по 15 серпня не діє).",
        "discountId": 5,
        "languageId": 1,
        "group": constants.ADULTS

    },
    {
        "name": "Пенсіонер - 10 % (старше 60 років).",
        "discountId": 6,
        "languageId": 1,
        "group": constants.ADULTS

    },
    {
        "name": "Інвалід - 10 % (1 і 2 група).",
        "discountId": 7,
        "languageId": 1,
        "group": constants.ADULTS

    },
    {
        "name": "Група (від 10 осіб) - 10 %.",
        "discountId": 8,
        "languageId": 1,
        "group": constants.BOTH

    },
    {
        "name": "Картка постійного клієнта (10%).",
        "discountId": 9,
        "languageId": 1,
        "group": constants.DISCOUNT_CARD

    },
    {
        "name": "Картка постійного клієнта (15%).",
        "discountId": 10,
        "languageId": 1,
        "group": constants.DISCOUNT_CARD
    },
    {
        "name": "Знижка на рейс",
        "discountId": 11,
        "languageId": 1,
        "group": constants.BUS_FLIGHT
    }
];

const discountAttributesRU = [
    {
        "name": "Ребенок от 0 до 1 года – 50 %.",
        "discountId": 1,
        "languageId": 2,
        "group": constants.CHILDREN

    },
    {
        "name": "Ребенок от 1 до 4 лет – 30 %.",
        "discountId": 2,
        "languageId": 2,
        "group": constants.CHILDREN

    },
    {
        "name": "Ребенок от 5 до 11 лет – 20 %.",
        "discountId": 3,
        "languageId": 2,
        "group": constants.CHILDREN

    },
    {
        "name": "Ребенок от 12 до 15 лет – 10 %.",
        "discountId": 4,
        "languageId": 2,
        "group": constants.CHILDREN

    },
    {
        "name": "Студент – 10 % (скидка в период с 15 июня по 15 августа бездействует).",
        "discountId": 5,
        "languageId": 2,
        "group": constants.ADULTS

    },
    {
        "name": "Пенсионер - 10% (старше 60 лет).",
        "discountId": 6,
        "languageId": 2,
        "group": constants.ADULTS

    },
    {
        "name": "Инвалид – 10 % (1 и 2 группа).",
        "discountId": 7,
        "languageId": 2,
        "group": constants.ADULTS

    },
    {
        "name": "Группа (от 10 человек) – 10 %.",
        "discountId": 8,
        "languageId": 2,
        "group": constants.BOTH

    },
    {
        "name": "Карта постоянного клиента (10%).",
        "discountId": 9,
        "languageId": 2,
        "group": constants.DISCOUNT_CARD

    },
    {
        "name": "Карта постоянного клиента (15%).",
        "discountId": 10,
        "languageId": 2,
        "group": constants.DISCOUNT_CARD
    },
    {
        "name": "Скидка на рейс",
        "discountId": 11,
        "languageId": 2,
        "group": constants.BUS_FLIGHT
    }
];

const discountAttributesDE = [
    {
        "name": "Ein Kind im Alter von 0 bis 1 Jahr – 50 %.",
        "discountId": 1,
        "languageId": 3,
        "group": constants.CHILDREN

    },
    {
        "name": "Kind von 1 bis 4 Jahren - 30 %.",
        "discountId": 2,
        "languageId": 3,
        "group": constants.CHILDREN

    },
    {
        "name": "Kind von 5 bis 11 Jahren - 20 %.",
        "discountId": 3,
        "languageId": 3,
        "group": constants.CHILDREN

    },
    {
        "name": "Kind von 12 bis 15 Jahren - 10 %.",
        "discountId": 4,
        "languageId": 3,
        "group": constants.CHILDREN

    },
    {
        "name": "Student - 10 % (Rabatt nicht gültig vom 15. Juni bis 15. August).",
        "discountId": 5,
        "languageId": 3,
        "group": constants.ADULTS

    },
    {
        "name": "Rentner - 10 % (über 60 Jahre alt).",
        "discountId": 6,
        "languageId": 3,
        "group": constants.ADULTS

    },
    {
        "name": "Behinderte – 10 % (Gruppe 1 und 2).",
        "discountId": 7,
        "languageId": 3,
        "group": constants.ADULTS

    },
    {
        "name": "Gruppe (ab 10 Personen) - 10 %.",
        "discountId": 8,
        "languageId": 3,
        "group": constants.BOTH

    },
    {
        "name": "Treuekundenkarte (10%).",
        "discountId": 9,
        "languageId": 3,
        "group": constants.DISCOUNT_CARD

    },
    {
        "name": "Treuekundenkarte (15%).",
        "discountId": 10,
        "languageId": 3,
        "group": constants.DISCOUNT_CARD
    },
    {
        "name": "Flugrabatt",
        "discountId": 11,
        "languageId": 3,
        "group": constants.BUS_FLIGHT
    }
];
module.exports = [...discountAttributesUK, ...discountAttributesRU, ...discountAttributesDE];