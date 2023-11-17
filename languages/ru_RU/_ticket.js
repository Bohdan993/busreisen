const { OPEN_DATE, ONE_WAY, ROUND } = require("../../helpers/constants");

const translations = {
    "saveAsPDFText": "Сохранить как PDF",
    "adultText": "Взрослый",
    "childText": "Ребенок",
    "nameText": "Имя",
    "lastNameText": "Фамилия",
    "dateOfBirthText": "Дата рождения",
    "passengerText": "Пассажир",
    "passengersText": "Пассажиры",
    "destinationText": "Туда",
    "returnText": "Обратно",
    "onboardingText": "Место посадки",
    "outboardingText": "Место высадки",
    "departureTimeText": "Время отправления",
    "arrivalTimeText": "Время прибытия",
    "additionalText": "время прибытия на следующие сутки",
    "additionalText2": "время прибытия зависит от прохода границы",
    "inGeneralText": "В общем",
    "discountText": "Скидка",
    "priceText": "Цена",
    "discountCardNumberText": "Номер карты",
    "ticketNumberText": "Номер билета:",
    "ticketTypeText": "Тип билета:",
    "dateOfBuingText": "Дата покупки:",
    "carrierText": "Перевозчик:",
    "routeText": "Маршрут:",
    "contactsText": "Контакты:",
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
        [OPEN_DATE]: "Открытая дата",
        [ROUND]: "В обе стороны"
    },
    "saleText": "Акционная скидка"

}


module.exports=translations;