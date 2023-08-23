const constants = require("../helpers/constants");

const discountAttributesUK = [
    {
        "name": "​Дітям від 0 до 4 років - 30% від вартості квитка",
        "discountId": 1,
        "languageId": 1,
        "group": constants.CHILDREN

    },
    {
        "name": "Дітям від 5 до 11 років - 20% від вартості квитка",
        "discountId": 2,
        "languageId": 1,
        "group": constants.CHILDREN

    },
    {
        "name": "Дітям від 12 до 16 років - 10% від вартості квитка",
        "discountId": 3,
        "languageId": 1,
        "group": constants.CHILDREN

    },
    {
        "name": "Студентам до 26 років (за умови пред'явлення ISIC) - 10% від вартості квитка. У період з 15 червня по 15 серпня знижка не діє",
        "discountId": 4,
        "languageId": 1,
        "group": constants.ADULTS

    },
    {
        "name": "​​Інвалідам 1 і 2 груп, пенсіонерам старше 60 років (При пред'явленні діючого посвідчення) - 10% від вартості квитка",
        "discountId": 5,
        "languageId": 1,
        "group": constants.ADULTS

    },
    {
        "name": "Групам від 10 осіб - 10% від вартості квитка",
        "discountId": 6,
        "languageId": 1,
        "group": constants.BOTH

    }
];

const discountAttributesRU = [
    {
        "name": "Детям от 0 до 4 лет – 30% от стоимости билета",
        "discountId": 1,
        "languageId": 2,
        "group": constants.CHILDREN

    },
    {
        "name": "Детям от 5 до 11 лет – 20% от стоимости билета",
        "discountId": 2,
        "languageId": 2,
        "group": constants.CHILDREN

    },
    {
        "name": "Детям от 12 до 16 лет – 10% от стоимости билета",
        "discountId": 3,
        "languageId": 2,
        "group": constants.CHILDREN

    },
    {
        "name": "Студентам до 26 лет (при предъявлении ISIC) – 10% от стоимости билета. В период с 15 июня по 15 августа скидка не действует",
        "discountId": 4,
        "languageId": 2,
        "group": constants.ADULTS

    },
    {
        "name": "​Инвалидам 1 и 2 групп, пенсионерам старше 60 лет (при предъявлении действующего удостоверения) – 10% от стоимости билета",
        "discountId": 5,
        "languageId": 2,
        "group": constants.ADULTS

    },
    {
        "name": "Группам от 10 человек – 10% от стоимости билета",
        "discountId": 6,
        "languageId": 2,
        "group": constants.BOTH

    }
];

const discountAttributesDE = [
    {
        "name": "Kinder ab 0 bis 4 Jahre – 30% Rückerstattung des Fahrpreises",
        "discountId": 1,
        "languageId": 3,
        "group": constants.CHILDREN

    },
    {
        "name": "Kinder ab 5 bis 11 Jahre – 20% Rückerstattung des Fahrpreises",
        "discountId": 2,
        "languageId": 3,
        "group": constants.CHILDREN

    },
    {
        "name": "Kinder ab 12 bis 16 Jahre – 10% Rückerstattung des Fahrpreises",
        "discountId": 3,
        "languageId": 3,
        "group": constants.CHILDREN

    },
    {
        "name": "Studenten (ISIC) in der Zeitperiode vom 15.08 bis zum 15.06 – 10% Rückerstattung des Fahrpreises",
        "discountId": 4,
        "languageId": 3,
        "group": constants.ADULTS

    },
    {
        "name": "Behinderten der 1. und 2. Gruppen, Rentner ab 60 Jahre – 10% Rückerstattung des Fahrpreises",
        "discountId": 5,
        "languageId": 3,
        "group": constants.ADULTS

    },
    {
        "name": "Gruppen ab 10 Personen – 10% Rückerstattung des Fahrpreises",
        "discountId": 6,
        "languageId": 3,
        "group": constants.BOTH

    }
];
module.exports = [...discountAttributesUK, ...discountAttributesRU, ...discountAttributesDE];