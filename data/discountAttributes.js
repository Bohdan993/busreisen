const constants = require("../helpers/constants");

const discountAttributesUK = [
    {
        "name": "Дітям від 0 до 1 року - 50 %.",
        "discountId": 1,
        "languageId": 1
    },
    {
        "name": "Дітям від 1 до 4 років - 30 %.",
        "discountId": 2,
        "languageId": 1
    },
    {
        "name": "Дітям від 5 до 11 років - 20 %.",
        "discountId": 3,
        "languageId": 1
    },
    {
        "name": "Дітям від 12 до 15 років - 10 %.",
        "discountId": 4,
        "languageId": 1
    },
    {
        "name": "Студентам (при наявності посвідчення) - 10 %. (Знижка в період з 15 червня по 15 серпня не діє).",
        "discountId": 5,
        "languageId": 1
    },
    {
        "name": "Військовим (при наявності посвідчення) - 10 %.",
        "discountId": 6,
        "languageId": 1
    },
    {
        "name": "Пенсіонерам старше 60 років (при наявності посвідчення) - 10 %.",
        "discountId": 7,
        "languageId": 1
    },
    {
        "name": "Інвалідам 1 і 2 групи (при наявності посвідчення) - 10 %.",
        "discountId": 8,
        "languageId": 1
    },
    {
        "name": "Групам (від 10 осіб) - 10 %.",
        "discountId": 9,
        "languageId": 1
    },
    {
        "name": "Картка постійного клієнта - 10%.",
        "discountId": 10,
        "languageId": 1
    },
    {
        "name": "Картка постійного клієнта - 15%.",
        "discountId": 11,
        "languageId": 1
    },
    {
        "name": "Знижка на рейс",
        "discountId": 12,
        "languageId": 1
    },
    {
        "name": "Знижка на рейс",
        "discountId": 13,
        "languageId": 1
    },
    {
        "name": "Знижка на рейс",
        "discountId": 14,
        "languageId": 1
    },
    {
        "name": "Знижка на рейс",
        "discountId": 15,
        "languageId": 1
    },
    {
        "name": "Знижка на рейс",
        "discountId": 16,
        "languageId": 1
    },
    {
        "name": "Знижка на рейс",
        "discountId": 17,
        "languageId": 1
    },
    {
        "name": "Знижка на рейс",
        "discountId": 18,
        "languageId": 1
    },
    {
        "name": "Знижка на рейс",
        "discountId": 19,
        "languageId": 1
    },
    {
        "name": "Знижка на рейс",
        "discountId": 20,
        "languageId": 1
    },
    {
        "name": "Знижка на рейс",
        "discountId": 21,
        "languageId": 1
    },
    {
        "name": "Знижка на рейс",
        "discountId": 22,
        "languageId": 1
    },
    {
        "name": "Знижка на рейс",
        "discountId": 23,
        "languageId": 1
    },
    {
        "name": "Знижка на рейс",
        "discountId": 24,
        "languageId": 1
    },
    {
        "name": "Знижка на рейс",
        "discountId": 25,
        "languageId": 1
    },
    {
        "name": "Знижка на рейс",
        "discountId": 26,
        "languageId": 1
    },
    {
        "name": "Знижка на рейс",
        "discountId": 27,
        "languageId": 1
    }
];

const discountAttributesRU = [
    {
        "name": "Детям от 0 до 1 года - 50 %.",
        "discountId": 1,
        "languageId": 2
    },
    {
        "name": "Детям от 1 до 4 лет - 30 %.",
        "discountId": 2,
        "languageId": 2
    },
    {
        "name": "Детям от 5 до 11 лет - 20 %.",
        "discountId": 3,
        "languageId": 2
    },
    {
        "name": "Детям от 12 до 15 лет - 10 %.",
        "discountId": 4,
        "languageId": 2
    },
    {
        "name": "Студентам (при наличии удостоверения) – 10 %. (Скидка в период с 15 июня по 15 августа не действует).",
        "discountId": 5,
        "languageId": 2
    },
    {
        "name": "Военным (при наличии удостоверения) – 10 %.",
        "discountId": 6,
        "languageId": 2
    },
    {
        "name": "Пенсионерам старше 60 лет (при наличии удостоверения) – 10%.",
        "discountId": 7,
        "languageId": 2
    },
    {
        "name": "Инвалидам 1 и 2 группы (при наличии удостоверения) – 10 %.",
        "discountId": 8,
        "languageId": 2
    },
    {
        "name": "Группам (от 10 человек) – 10%.",
        "discountId": 9,
        "languageId": 2
    },
    {
        "name": "Карта постоянного клиента – 10%.",
        "discountId": 10,
        "languageId": 2
    },
    {
        "name": "Карта постоянного клиента – 15%.",
        "discountId": 11,
        "languageId": 2
    },
    {
        "name": "Скидка на рейс",
        "discountId": 12,
        "languageId": 2
    },
    {
        "name": "Скидка на рейс",
        "discountId": 13,
        "languageId": 2
    },
    {
        "name": "Скидка на рейс",
        "discountId": 14,
        "languageId": 2
    },
    {
        "name": "Скидка на рейс",
        "discountId": 15,
        "languageId": 2
    },
    {
        "name": "Скидка на рейс",
        "discountId": 16,
        "languageId": 2
    },
    {
        "name": "Скидка на рейс",
        "discountId": 17,
        "languageId": 2
    },
    {
        "name": "Скидка на рейс",
        "discountId": 18,
        "languageId": 2
    },
    {
        "name": "Скидка на рейс",
        "discountId": 19,
        "languageId": 2
    },
    {
        "name": "Скидка на рейс",
        "discountId": 20,
        "languageId": 2
    },
    {
        "name": "Скидка на рейс",
        "discountId": 21,
        "languageId": 2
    },
    {
        "name": "Скидка на рейс",
        "discountId": 22,
        "languageId": 2
    },
    {
        "name": "Скидка на рейс",
        "discountId": 23,
        "languageId": 2
    },
    {
        "name": "Скидка на рейс",
        "discountId": 24,
        "languageId": 2
    },
    {
        "name": "Скидка на рейс",
        "discountId": 25,
        "languageId": 2
    },
    {
        "name": "Скидка на рейс",
        "discountId": 26,
        "languageId": 2
    },
    {
        "name": "Скидка на рейс",
        "discountId": 27,
        "languageId": 2
    }
];

const discountAttributesDE = [
    {
        "name": "Kinder von 0 bis 1 Jahr - 50 %.",
        "discountId": 1,
        "languageId": 3
    },
    {
        "name": "Kinder von 1 bis 4 Jahren - 30 %.",
        "discountId": 2,
        "languageId": 3
    },
    {
        "name": "Kinder von 5 bis 11 Jahren - 20 %.",
        "discountId": 3,
        "languageId": 3
    },
    {
        "name": "Kinder von 12 bis 15 Jahren - 10 %.",
        "discountId": 4,
        "languageId": 3
    },
    {
        "name": "Studierende (sofern sie über ein Zertifikat verfügen) – 10 %. (Der Rabatt gilt nicht vom 15. Juni bis 15. August).",
        "discountId": 5,
        "languageId": 3
    },
    {
        "name": "Militär (sofern ein Zertifikat vorliegt) – 10 %.",
        "discountId": 6,
        "languageId": 3
    },
    {
        "name": "Rentner über 60 Jahre (sofern sie über eine Bescheinigung verfügen) – 10 %.",
        "discountId": 7,
        "languageId": 3
    },
    {
        "name": "Behinderte der Gruppen 1 und 2 (sofern sie über ein Zertifikat verfügen) – 10 %.",
        "discountId": 8,
        "languageId": 3
    },
    {
        "name": "Gruppen (ab 10 Personen) – 10 %.",
        "discountId": 9,
        "languageId": 3
    },
    {
        "name": "Treuekundenkarte – 10 %.",
        "discountId": 10,
        "languageId": 3
    },
    {
        "name": "Treuekundenkarte – 15 %.",
        "discountId": 11,
        "languageId": 3
    },
    {
        "name": "Flugrabatt",
        "discountId": 12,
        "languageId": 3
    },
    {
        "name": "Flugrabatt",
        "discountId": 13,
        "languageId": 3
    },
    {
        "name": "Flugrabatt",
        "discountId": 14,
        "languageId": 3
    },
    {
        "name": "Flugrabatt",
        "discountId": 15,
        "languageId": 3
    },
    {
        "name": "Flugrabatt",
        "discountId": 16,
        "languageId": 3
    },
    {
        "name": "Flugrabatt",
        "discountId": 17,
        "languageId": 3
    },
    {
        "name": "Flugrabatt",
        "discountId": 18,
        "languageId": 3
    },
    {
        "name": "Flugrabatt",
        "discountId": 19,
        "languageId": 3
    },
    {
        "name": "Flugrabatt",
        "discountId": 20,
        "languageId": 3
    },
    {
        "name": "Flugrabatt",
        "discountId": 21,
        "languageId": 3
    },
    {
        "name": "Flugrabatt",
        "discountId": 22,
        "languageId": 3
    },
    {
        "name": "Flugrabatt",
        "discountId": 23,
        "languageId": 3
    },
    {
        "name": "Flugrabatt",
        "discountId": 24,
        "languageId": 3
    },
    {
        "name": "Flugrabatt",
        "discountId": 25,
        "languageId": 3
    },
    {
        "name": "Flugrabatt",
        "discountId": 26,
        "languageId": 3
    },
    {
        "name": "Flugrabatt",
        "discountId": 27,
        "languageId": 3
    }
];
module.exports = [...discountAttributesUK, ...discountAttributesRU, ...discountAttributesDE];