const { OPEN_DATE, ONE_WAY, ROUND } = require("../../helpers/constants");

const translations = {
    "saveAsPDFText": "Als PDF speichern",
    "adultText": "Erwachsener",
    "childText": "Kind",
    "nameText": "Name",
    "lastNameText": "Nachname",
    "dateOfBirthText": "Geburtsdatum",
    "passangerText": "Passagier",
    "passangersText": "Passagiere",
    "destinationText": "An",
    "returnText": "Zurück",
    "onboardingText": "Einstiegsort",
    "outboardingText": "Ausschiffungsort",
    "departureTimeText": "Abfahrtszeit",
    "arrivalTimeText": "Ankunftszeit",
    "additionalText": "Ankunftszeit für den nächsten Tag",
    "additionalText2": "Ankunftszeit hängt vom Grenzübergang ab",
    "inGeneralText": "Allgemein",
    "discountText": "Rabatt",
    "priceText": "Preis",
    "discountCardNumberText": "Kartennummer",
    "ticketNumberText": "Ticketnummer:",
    "ticketTypeText": "Tickettyp:",
    "dateOfBuingText": "Kaufdatum:",
    "carrierText": "Träger:",
    "routeText": "Route:",
    "contactsText": "Kontakte:",
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
        [ONE_WAY]: "Ein Weg",
        [OPEN_DATE]: "Offener Termin",
        [ROUND]: "Rundfahrt"
    },
    "saleText": "Aktionsrabatt"
}



module.exports = translations;