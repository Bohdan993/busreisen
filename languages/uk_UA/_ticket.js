const { OPEN_DATE, ONE_WAY, ROUND } = require("../../helpers/constants");


const translations = {
    "saveAsPDFText": "Зберегти як PDF",
    "adultText": "Дорослий",
    "childText": "Дитина",
    "nameText": "Ім'я",
    "lastNameText": "Прізвище",
    "dateOfBirthText": "Дата народження",
    "passangerText": "Пасажир",
    "passangersText": "Пасажири",
    "destinationText": "Туди",
    "returnText": "Назад",
    "onboardingText": "Місце посадки",
    "outboardingText": "Місце висадки",
    "departureTimeText": "Час відправлення",
    "arrivalTimeText": "Час прибуття",
    "additionalText": "час прибуття на наступну добу",
    "additionalText2": "час прибуття залежить від проходу кордону",
    "inGeneralText": "Загалом",
    "discountText": "Знижка",
    "priceText": "Ціна",
    "discountCardNumberText": "Номер карти",
    "ticketNumberText": "Номер квитка:",
    "ticketTypeText": "Тип квитка:",
    "dateOfBuingText": "Дата покупки:",
    "carrierText": "Перевізник:",
    "routeText": "Маршрут:",
    "contactsText": "Контакти:",
    "phoneNums": [
         "+38 044 360 34 05", 
         "+38 050 168 45 45", 
         "+38 067 903 82 20", 
         "+38 093 466 00 96",
         "--separator--",
         "+49 511 165 800 83",
         "+49 391 505 583 25",
         "+49 941 569 581 39"
    ],
    "ticketTypes": {
        [ONE_WAY]: "В одну сторону",
        [OPEN_DATE]: "Відкрита дата",
        [ROUND]: "В обидві сторони"
    },
    "saleText": "Акційна знижка"

}


module.exports = translations;