const constants = require("../helpers/constants");

const discounts = [
    {
        "id": 1,
        "coef": 0.50,
        "inactivePeriod": null,
        "order": 100,
        "group": constants.CHILDREN,
        "maxAge": 1
    },
    {
        "id": 2,
        "coef": 0.30,
        "inactivePeriod": null,
        "order": 101,
        "group": constants.CHILDREN,
        "maxAge": 4
    },
    {
        "id": 3,
        "coef": 0.20,
        "inactivePeriod": null,
        "order": 102,
        "group": constants.CHILDREN,
        "maxAge": 11
    },
    {
        "id": 4,
        "coef": 0.10,
        "inactivePeriod": null,
        "order": 103,
        "group": constants.CHILDREN,
        "maxAge": 15
    },
    {
        "id": 5,
        "coef": 0.10,
        "inactivePeriod": "06-15|08-15",
        "order": 104,
        "group": constants.ADULTS
    },
    {
        "id": 6,
        "coef": 0.10,
        "inactivePeriod": null,
        "order": 107,
        "group": constants.ADULTS
    },
    {
        "id": 7,
        "coef": 0.10,
        "inactivePeriod": null,
        "order": 105,
        "group": constants.ADULTS,
        "minAge": 60
    },
    {
        "id": 8,
        "coef": 0.10,
        "inactivePeriod": null,
        "order": 106,
        "group": constants.ADULTS
    },
    {
        "id": 9,
        "coef": 0.10,
        "inactivePeriod": null,
        "order": 108,
        "group": constants.BOTH
    },
    {
        "id": 10,
        "coef": 0.10,
        "inactivePeriod": null,
        "order": 109,
        "group": constants.DISCOUNT_CARD
    },
    {
        "id": 11,
        "coef": 0.15,
        "inactivePeriod": null,
        "order": 110,
        "group": constants.DISCOUNT_CARD
    },
    ////////////////////////////
    ////////////////////////////
    {
        "id": 12,
        "coef": 0.1,
        "inactivePeriod": null,
        "busflightId": 17,
        "group": constants.BUS_FLIGHT
    },
    {
        "id": 13,
        "coef": 0.15,
        "inactivePeriod": null,
        "busflightId": 18,
        "group": constants.BUS_FLIGHT
    },
    {
        "id": 14,
        "coef": 0.12,
        "inactivePeriod": null,
        "busflightId": 19,
        "group": constants.BUS_FLIGHT
    },
    {
        "id": 15,
        "coef": 0.14,
        "inactivePeriod": null,
        "busflightId": 20,
        "group": constants.BUS_FLIGHT
    },
    {
        "id": 16,
        "coef": 0.2,
        "inactivePeriod": null,
        "busflightId": 21,
        "group": constants.BUS_FLIGHT
    },
    {
        "id": 17,
        "coef": 0.25,
        "inactivePeriod": null,
        "busflightId": 22,
        "group": constants.BUS_FLIGHT
    },
    {
        "id": 18,
        "coef": 0.15,
        "inactivePeriod": null,
        "busflightId": 23,
        "group": constants.BUS_FLIGHT
    },
    {
        "id": 19,
        "coef": 0.16,
        "inactivePeriod": null,
        "busflightId": 24,
        "group": constants.BUS_FLIGHT
    },
    {
        "id": 20,
        "coef": 0.15,
        "inactivePeriod": null,
        "busflightId": 25,
        "group": constants.BUS_FLIGHT
    },
    {
        "id": 21,
        "coef": 0.1,
        "inactivePeriod": null,
        "busflightId": 26,
        "group": constants.BUS_FLIGHT
    },
    {
        "id": 22,
        "coef": 0.18,
        "inactivePeriod": null,
        "busflightId": 27,
        "group": constants.BUS_FLIGHT
    },
    {
        "id": 23,
        "coef": 0.25,
        "inactivePeriod": null,
        "busflightId": 28,
        "group": constants.BUS_FLIGHT
    },
    {
        "id": 24,
        "coef": 0.2,
        "inactivePeriod": null,
        "busflightId": 29,
        "group": constants.BUS_FLIGHT
    },
    {
        "id": 25,
        "coef": 0.15,
        "inactivePeriod": null,
        "busflightId": 30,
        "group": constants.BUS_FLIGHT
    },
    {
        "id": 26,
        "coef": 0.2,
        "inactivePeriod": null,
        "busflightId": 31,
        "group": constants.BUS_FLIGHT
    },
    {
        "id": 27,
        "coef": 0.12,
        "inactivePeriod": null,
        "busflightId": 32,
        "group": constants.BUS_FLIGHT
    }

];

module.exports = discounts;