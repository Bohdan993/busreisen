const { Router } = require("express");
const router = Router();
const { Op, QueryTypes } = require("sequelize");
const CityModel = require("../../models/city");
const CityAttributesModel = require("../../models/cityAttributes");
const PlaceModel = require("../../models/place");
const PlaceAttributesModel = require("../../models/placeAttributes");
const LanguagesModel = require("../../models/language");
const CurrencyModel = require("../../models/currency");
const BusFlightPricesModel = require("../../models/busFlightPrices");
const BusFlightModel = require("../../models/busFlight");
const RouteModel = require("../../models/route");
const RouteAttributesModel = require("../../models/routeAttributes");
const DiscountModel = require("../../models/discount");
const DiscountAttributesModel = require("../../models/discountAttributes");
const {
  isSpecialDate,
  loadLanguageFile,
  isValidDate,
} = require("../../helpers");
const { validateDates } = require("../../middlewares/busFlightMiddlewares");
const {
  filterBusFlights,
  transformBusFlights,
  filterBusFlightsAvailableDates,
  filterBusFlightsWithFreeSeats,
  customRoutesFilter,
} = require("../../services/busFlightService");
const {
  checkIfSessionIsStarted, /*checkIfSessionIsFinished,*/
} = require("../../middlewares/sessionMiddlewares");
const sequelize = require("../../db");
const constants = require("../../helpers/constants");
const { customRoutesFilterMap } = require("../../extra");
const APIError = require("../../exeptions/api-error");


router.get("/", validateDates, async (req, res, next) => {
  try {
    let busFlights = [];
    let cities = [];
    let price = "";

    const {
      languageCode = "uk_UA",
      mode = "html",
      startDate = null,
      endDate = null,
      originId = null,
      destinationId = null,
      adults = 1,
      children = 0,
      currencyAbbr = null,
    } = req?.query;

    const lang = await LanguagesModel.findOne({
      where: {
        code: {
          [Op.eq]: languageCode,
        },
      },
    });

    const error404Translations = loadLanguageFile("404-error.js", lang?.code);

    let currency = await CurrencyModel.findOne({
      attributes: ["id", "name", "abbr", "symbol"],
      where: {
        abbr: {
          [Op.eq]: currencyAbbr,
        },
      },
    });

    currency = currency?.toJSON();

    let query = {
      attributes: ["id", "allSeats", "freeSeats", "routeId", "dateOfDeparture"],
      where: {},
      include: [
        {
          model: RouteModel,
          include: [
            {
              model: RouteAttributesModel,
              attributes: ["name"],
              where: {
                languageId: {
                  [Op.eq]: lang?.id,
                },
              }
            }
          ]
        },
        {
          model: DiscountModel,
          attributes: ["id", "coef", "busflightId", "group"],
          // where: {
          //   group: {
          //     [Op.eq]: constants.BUS_FLIGHT,
          //   },
          // },
          // include: [
          //   {
          //     model: DiscountAttributesModel,
          //     where: {
          //       languageId: {
          //         [Op.eq]: 1,
          //       }
          //     },
          //   },
          // ],
        },
      ],
      order: [
        ["dateOfDeparture", "ASC"],
        ["routeId", "ASC"],
      ],
    };

    if (isSpecialDate(endDate)) {
      query.where.dateOfDeparture = {};
      query.where.dateOfDeparture = isValidDate(new Date(startDate))
        ? startDate
        : null;
    } else {
      query.where.dateOfDeparture = {};
      query.where.dateOfDeparture[Op.or] = [
        isValidDate(new Date(startDate)) ? startDate : null,
        isValidDate(new Date(endDate)) ? endDate : null,
      ];
    }

    busFlights = await BusFlightModel.findAll(query);
    busFlights = busFlights?.map((bf) => bf?.toJSON());
    
    if (!busFlights?.length) {
      throw APIError.NotFoundError("not found", "error-404", {
        translations: error404Translations,
        isShowBtn: true,
      });
    }

    const filteredBusFlightsWithFreeSeats = filterBusFlightsWithFreeSeats({
      busFlights,
      numOfPassengers: parseInt(adults) + parseInt(children),
    });

    if (!filteredBusFlightsWithFreeSeats.length) {
      throw APIError.NotFoundError("not found", "error-404", {
        translations: loadLanguageFile(
          "_404-error-no-free-seats.js",
          lang?.code
        ),
        isShowBtn: true,
      });
    }

    const filteredBusFlights = filterBusFlights({
      busFlights: filteredBusFlightsWithFreeSeats,
      originId,
      destinationId,
      startDate,
      endDate,
      customRoutesFilter,
    });

    if (!filteredBusFlights?.resultFrom?.length) {

      throw APIError.NotFoundError("not found", "error-404", {
        translations: error404Translations,
        isShowBtn: true,
      });
    }

    let placeIds = [
      ...filteredBusFlights?.resultFrom.map((el) =>
        el?.route?.routePath?.onboarding.map((item) => item?.placeId)
      ),
      ...filteredBusFlights?.resultFrom.map((el) =>
        el?.route?.routePath?.outboarding.map((item) => item?.placeId)
      ),
    ];

    let cityQuery = {
      attributes: ["id"],
      where: {
        id: {
          [Op.or]: [originId, destinationId],
        },
      },
      include: [
        {
          model: CityAttributesModel,
          attributes: ["name", "cityId", "languageId"],
          where: {
            languageId: {
              [Op.eq]: lang?.id,
            },
          },
        },
        {
          model: PlaceModel,
          attributes: ["id"],
          include: [
            {
              model: PlaceAttributesModel,
              attributes: ["name", "placeId", "languageId"],
              where: {
                languageId: {
                  [Op.eq]: lang?.id,
                },
                placeId: {
                  [Op.or]: Array.from(new Set(placeIds)),
                },
              },
            },
          ],
        },
      ],
    };

    cities = await CityModel.findAll(cityQuery);

    if (!cities?.length || cities?.length !== 2) {
      throw APIError.NotFoundError("not found", "error-404", {
        translations: error404Translations,
        isShowBtn: true,
      });
    }

    cities = cities?.map((city) => city?.toJSON());

    let priceQuery = {
        attributes: [
          "currencyId",
          "firstCityId",
          "secondCityId",
          "priceOneWay",
          "priceRoundTrip",
        ],
        where: {
            firstCityId: {
                [Op.or]: [
                    originId, destinationId
                ]
            },
            secondCityId: {
                [Op.or]: [
                    originId, destinationId
                ]
            },
            currencyId: currency?.id
        }
    };

    price = await BusFlightPricesModel.findAll(priceQuery);
    price = price.map(p => p?.toJSON());

    const transformedBusFlights = transformBusFlights({
      busFlights: filteredBusFlights,
      cities,
      price,
      currency,
      originId,
      destinationId,
      endDate,
      startDate,
      languageCode: lang?.code,
    });

    req.session.regenerate(function (err) {
      if (err) next(err);

      req.session.busFlights = transformedBusFlights;
      req.session.startDate = startDate;
      req.session.endDate = endDate;
      req.session.currency = currency;
      req.session.adults = adults;
      req.session.children = children;
      req.session.originId = originId;
      req.session.destinationId = destinationId;
      req.session.selectedBusFlight = transformedBusFlights[0];
      req.session.selectedBusFlight.isSelected = true;
      req.session.isStarted = true;

      req.session.save(function (err) {
        if (err) return next(err);

        if (mode?.toLowerCase() === "json") {
          return res.json({ status: "ok", data: transformedBusFlights });
        }

        if (mode?.toLowerCase() === "html" || !mode) {
          return res.render("ticket-list", {
            flightsData: transformedBusFlights,
            translations: loadLanguageFile("ticket-list.js", lang?.code),
          });
        }
      });
    });
  } catch (err) {
    return next(err);
  }
});

router.get(
  "/alternatives",
  validateDates,
  async (req, res, next) => {
    try {
      let busFlights = [];
      let cities = [];
      let price = "";

      const {
        languageCode = "uk_UA",
        mode = "html",
        startDate = null,
        endDate = null,
        originId = null,
        destinationId = null,
        adults = 1,
        children = 0,
        direction = constants.FORWARDS,
        currencyAbbr = null
      } = req?.query;

      const lang = await LanguagesModel.findOne({
        where: {
          code: {
            [Op.eq]: languageCode,
          },
        },
      });


      let currency;
      
      if(!req.session?.selectedBusFlight?.isSelected) {
        currency = await CurrencyModel.findOne({
          attributes: ["id", "name", "abbr", "symbol"],
          where: {
            abbr: {
              [Op.eq]: currencyAbbr,
            },
          },
        });
    
        currency = currency?.toJSON();
      }

      const error404Translations = loadLanguageFile(
        "_404-error-no-alternative-tickets.js",
        lang?.code
      );

      // let query = {
      //     attributes: ["id", "allSeats", "freeSeats", "routeId", "dateOfDeparture"],
      //     where:{
      //         dateOfDeparture: {
      //             [Op.gt]: isValidDate(new Date(startDate)) ? startDate : null
      //         }
      //     },
      //     include: [
      //         {
      //             model: Route,
      //             attributes: ["routePath"],
      //             where:{
      //                 [Op.and]: [
      //                     sequelize.where(
      //                         sequelize.fn(
      //                             "JSON_CONTAINS",
      //                             sequelize.col("routePath"),
      //                             sequelize.fn("JSON_OBJECT", "cityId", 1),
      //                             `\$.onboarding`
      //                             ),
      //                         1)
      //                         ,
      //                     sequelize.where(
      //                         sequelize.fn(
      //                             "JSON_CONTAINS",
      //                             sequelize.col("routePath"),
      //                             sequelize.fn("JSON_OBJECT", "cityId", 8),
      //                             `\$.outboarding`
      //                             ),
      //                         1)
      //                 ]
      //             }
      //         }
      //     ],
      //     order: [
      //         ["dateOfDeparture", "ASC"],
      //         ["routeId", "ASC"],
      //     ],
      //     limit: 3
      // };
      // busFlights = await BusFlight.findAll(query);

      let limit = 3;
      if (
        customRoutesFilterMap.hasOwnProperty(parseInt(originId)) ||
        customRoutesFilterMap.hasOwnProperty(parseInt(destinationId))
      ) {
        const key = customRoutesFilterMap.hasOwnProperty(parseInt(originId))
          ? parseInt(originId)
          : parseInt(destinationId);
        limit = limit * (customRoutesFilterMap[key].length + 1);
      }


      // const q = process.env.DB_DIALECT === "mysql" ? "SELECT `busflight`.`id`, `busflight`.`allSeats`, `busflight`.`freeSeats`, `busflight`.`routeId`, `busflight`.`dateOfDeparture`, `route`.`id` AS `route.id`, `route`.`routePath` AS `route.routePath`, `route`.`createdAt` AS `route.createdAt`, `route`.`updatedAt` AS `route.updatedAt`, `route->RouteAttributes`.`id` AS `route.RouteAttributes.id`, `route->RouteAttributes`.`name` AS `route.RouteAttributes.name`,`discount`.`id` AS `discount.id`, `discount`.`coef` AS `discount.coef`, `discount`.`busflightId` AS `discount.busflightId`, `discount->DiscountAttributes`.`languageId` AS `discount.DiscountAttributes.languageId`, `discount->DiscountAttributes`.`discountId` AS `discount.DiscountAttributes.discountId`, `discount->DiscountAttributes`.`group` AS `discount.DiscountAttributes.group` FROM `busflights` AS `busflight` INNER JOIN ( `routes` AS `route` INNER JOIN `RouteAttributes` AS `route->RouteAttributes` ON `route`.`id` = `route->RouteAttributes`.`routeId` AND `route->RouteAttributes`.`languageId` = :languageId ) ON `busflight`.`routeId` = `route`.`id` AND (JSON_CONTAINS(`routePath`, JSON_OBJECT('cityId', :originId), '$.onboarding') = 1 AND JSON_CONTAINS(`routePath`, JSON_OBJECT('cityId', :destinationId), '$.outboarding') = 1) LEFT OUTER JOIN ( `discounts` AS `discount` INNER JOIN `DiscountAttributes` AS `discount->DiscountAttributes` ON `discount`.`id` = `discount->DiscountAttributes`.`discountId` AND `discount->DiscountAttributes`.`languageId` = :languageId AND `discount->DiscountAttributes`.`group` = :group ) ON `busflight`.`id` = `discount`.`busflightId` WHERE `busflight`.`dateOfDeparture` > :dateOfDeparture ORDER BY `busflight`.`dateOfDeparture` ASC, `busflight`.`routeId` ASC LIMIT :limit" :
      // 'SELECT "busflight"."id", "busflight"."allSeats", "busflight"."freeSeats", "busflight"."routeId", "busflight"."dateOfDeparture", "route"."id" AS "route.id", "route"."routePath" AS "route.routePath", "route"."createdAt" AS "route.createdAt", "route"."updatedAt" AS "route.updatedAt", "route->RouteAttributes"."id" AS "route.RouteAttributes.id", "route->RouteAttributes"."name" AS "route.RouteAttributes.name", "discount"."id" AS "discount.id", "discount"."coef" AS "discount.coef", "discount"."busflightId" AS "discount.busflightId", "discount->DiscountAttributes"."languageId" AS "discount.DiscountAttributes.languageId", "discount->DiscountAttributes"."discountId" AS "discount.DiscountAttributes.discountId", "discount->DiscountAttributes"."group" AS "discount.DiscountAttributes.group" FROM "busflights" AS "busflight" INNER JOIN ( "routes" AS "route" INNER JOIN "RouteAttributes" AS "route->RouteAttributes" ON "route"."id" = "route->RouteAttributes"."routeId" AND "route->RouteAttributes"."languageId" = :languageId ) ON "busflight"."routeId" = "route"."id" AND ("route"."routePath"::json -> \'onboarding\')::jsonb @> \'[{"cityId":' + parseInt(originId) + '}]\'::jsonb AND ("route"."routePath"::json -> \'outboarding\')::jsonb @> \'[{"cityId":' + parseInt(destinationId) + '}]\'::jsonb LEFT OUTER JOIN ( "discounts" AS "discount" INNER JOIN "DiscountAttributes" AS "discount->DiscountAttributes" ON "discount"."id" = "discount->DiscountAttributes"."discountId" AND "discount->DiscountAttributes"."languageId" = :languageId AND "discount->DiscountAttributes"."group" = :group ) ON "busflight"."id" = "discount"."busflightId" WHERE "busflight"."dateOfDeparture" > :dateOfDeparture ORDER BY "busflight"."dateOfDeparture" ASC, "busflight"."routeId" ASC LIMIT :limit'; 

      const q = process.env.DB_DIALECT === "mysql" ? "SELECT `busflight`.`id`, `busflight`.`allSeats`, `busflight`.`freeSeats`, `busflight`.`routeId`, `busflight`.`dateOfDeparture`, `route`.`id` AS `route.id`, `route`.`routePath` AS `route.routePath`, `route`.`createdAt` AS `route.createdAt`, `route`.`updatedAt` AS `route.updatedAt`, `route->RouteAttributes`.`id` AS `route.RouteAttributes.id`, `route->RouteAttributes`.`name` AS `route.RouteAttributes.name`,`discount`.`id` AS `discount.id`, `discount`.`coef` AS `discount.coef`, `discount`.`busflightId` AS `discount.busflightId`, `discount`.`group` AS `discount.group` FROM `busflights` AS `busflight` INNER JOIN ( `routes` AS `route` INNER JOIN `RouteAttributes` AS `route->RouteAttributes` ON `route`.`id` = `route->RouteAttributes`.`routeId` AND `route->RouteAttributes`.`languageId` = :languageId ) ON `busflight`.`routeId` = `route`.`id` AND (JSON_CONTAINS(`routePath`, JSON_OBJECT('cityId', :originId), '$.onboarding') = 1 AND JSON_CONTAINS(`routePath`, JSON_OBJECT('cityId', :destinationId), '$.outboarding') = 1) LEFT OUTER JOIN `discounts` AS `discount` ON `busflight`.`id` = `discount`.`busflightId` AND `discount`.`group` = :group WHERE `busflight`.`dateOfDeparture` > :dateOfDeparture ORDER BY `busflight`.`dateOfDeparture` ASC, `busflight`.`routeId` ASC LIMIT :limit" :
      'SELECT "busflight"."id", "busflight"."allSeats", "busflight"."freeSeats", "busflight"."routeId", "busflight"."dateOfDeparture", "route"."id" AS "route.id", "route"."routePath" AS "route.routePath", "route"."createdAt" AS "route.createdAt", "route"."updatedAt" AS "route.updatedAt", "route->RouteAttributes"."id" AS "route.RouteAttributes.id", "route->RouteAttributes"."name" AS "route.RouteAttributes.name", "discount"."id" AS "discount.id", "discount"."coef" AS "discount.coef", "discount"."busflightId" AS "discount.busflightId", "discount"."group" AS "discount.group" FROM "busflights" AS "busflight" INNER JOIN ( "routes" AS "route" INNER JOIN "RouteAttributes" AS "route->RouteAttributes" ON "route"."id" = "route->RouteAttributes"."routeId" AND "route->RouteAttributes"."languageId" = :languageId ) ON "busflight"."routeId" = "route"."id" AND ("route"."routePath"::json -> \'onboarding\')::jsonb @> \'[{"cityId":' + parseInt(originId) + '}]\'::jsonb AND ("route"."routePath"::json -> \'outboarding\')::jsonb @> \'[{"cityId":' + parseInt(destinationId) + '}]\'::jsonb LEFT OUTER JOIN "discounts" AS "discount" ON "busflight"."id" = "discount"."busflightId" AND "discount"."group" = :group WHERE "busflight"."dateOfDeparture" > :dateOfDeparture ORDER BY "busflight"."dateOfDeparture" ASC, "busflight"."routeId" ASC LIMIT :limit';

      busFlights = await sequelize.query(
        q,
        {
          type: QueryTypes.SELECT,
          nest: true,
          replacements: {
            dateOfDeparture: isValidDate(new Date(startDate))
              ? startDate
              : null,
            originId: parseInt(originId) || 0,
            destinationId: parseInt(destinationId) || 0,
            limit: limit,
            languageId: lang?.id,
            group: constants.BUS_FLIGHT,
          },
        }
      );

      busFlights = busFlights.map((bf) =>
        BusFlightModel.build(bf, {
          include: [
            {
              model: RouteModel,
              attributes: ["id", "routePath"],
              include: [
                {
                  model: RouteAttributesModel,
                  attributes: ["name"]
                }
              ]
            },
            {
              model: DiscountModel,
              attributes: ["id", "coef", "busflightId", "group"],
              // include: [
              //   {
              //     model: DiscountAttributesModel,
              //     attributes: ["group"],
              //   },
              // ],
            },
          ],
        })
      );

      busFlights = busFlights?.map((bf) => bf?.toJSON());

      if (!busFlights?.length) {
        throw APIError.NotFoundError("not found", "error-404", {
          translations: error404Translations,
          isShowBtn: false,
        });
      }

      const filteredBusFlightsWithFreeSeats = filterBusFlightsWithFreeSeats({
        busFlights,
        numOfPassengers: parseInt(adults) + parseInt(children),
      });

      if (!filteredBusFlightsWithFreeSeats.length) {
        throw APIError.NotFoundError("not found", "error-404", {
          translations: loadLanguageFile(
            "_404-error-no-alternative-tickets-free-seats.js",
            lang?.code
          ),
          isShowBtn: false,
        });
      }

      const filteredBusFlights = filterBusFlights({
        busFlights: filteredBusFlightsWithFreeSeats,
        originId,
        destinationId,
        startDate,
        endDate,
        customRoutesFilter,
        isAlternativeBusFlights: true,
      });

      if (!filteredBusFlights?.resultFrom?.length) {
        throw APIError.NotFoundError("not found", "error-404", {
          translations: error404Translations,
          isShowBtn: false,
        });
      }

      let placeIds = [
        ...filteredBusFlights?.resultFrom.map((el) =>
          el?.route?.routePath?.onboarding.map((item) => item?.placeId)
        ),
        ...filteredBusFlights?.resultFrom.map((el) =>
          el?.route?.routePath?.outboarding.map((item) => item?.placeId)
        ),
      ];

      let cityQuery = {
        attributes: ["id"],
        where: {
          id: {
            [Op.or]: [originId, destinationId],
          },
        },
        include: [
          {
            model: CityAttributesModel,
            attributes: ["name", "cityId", "languageId"],
            where: {
              languageId: {
                [Op.eq]: lang?.id,
              },
            },
          },
          {
            model: PlaceModel,
            attributes: ["id"],
            include: [
              {
                model: PlaceAttributesModel,
                attributes: ["name", "placeId", "languageId"],
                where: {
                  languageId: {
                    [Op.eq]: lang?.id,
                  },
                  placeId: {
                    [Op.or]: Array.from(new Set(placeIds)),
                  },
                },
              },
            ],
          },
        ],
      };

      cities = await CityModel.findAll(cityQuery);

      if (!cities?.length || cities?.length !== 2) {
        throw APIError.NotFoundError("not found", "error-404", {
          translations: error404Translations,
          isShowBtn: false,
        });
      }

      cities = cities?.map((city) => city?.toJSON());

      let priceQuery = {
        attributes: [
          "currencyId",
          "firstCityId",
          "secondCityId",
          "priceOneWay",
          "priceRoundTrip",
        ],
        where: {
            firstCityId: {
                [Op.or]: [
                    originId, destinationId
                ]
            },
            secondCityId: {
                [Op.or]: [
                    originId, destinationId
                ]
            },
            currencyId: currency?.id || req.session?.currency?.id || 1
        }
      };

      price = await BusFlightPricesModel.findAll(priceQuery);
      price = price.map(p => p?.toJSON());

      let transformedBusFlights = transformBusFlights({
        busFlights: filteredBusFlights,
        cities,
        price,
        currency: currency || req.session?.currency,
        originId,
        destinationId,
        endDate,
        startDate,
        languageCode: lang?.code,
        isAlternativeBusFlights: true,
        direction
      });

      transformedBusFlights = transformedBusFlights.reduce((acc, curr) => {
        if (!acc[curr?.dates?.departure]) {
          acc[curr?.dates?.departure] = [curr];
        } else {
          acc[curr?.dates?.departure].push(curr);
        }

        return acc;
      }, {});

      transformedBusFlights = Object.entries(transformedBusFlights);

      function saveSessionCb(err) {
        if (err) return next(err);

        if (mode?.toLowerCase() === "json") {
          return res.json({ status: "ok", data: transformedBusFlights });
        }

        if (mode?.toLowerCase() === "html" || !mode) {
          return res.render("alternative-tickets", {
            isForwards: direction === constants.FORWARDS,
            cityFrom: cities?.filter((city) =>
              city?.CityAttributes.find(
                (el) => String(el?.cityId) === String(originId)
              )
            )?.[0]?.CityAttributes?.[0]?.name,
            cityTo: cities?.filter((city) =>
              city?.CityAttributes.find(
                (el) => String(el?.cityId) === String(destinationId)
              )
            )?.[0]?.CityAttributes?.[0]?.name,
            flightsData: transformedBusFlights,
            translations: loadLanguageFile("ticket-list.js", lang?.code),
          });
        }
      }

      if(!req.session?.selectedBusFlight?.isSelected && direction === constants.FORWARDS) {
        return req.session.regenerate(function (err) {
          if (err) next(err);

          if (
            !req.session.alternativeBusFlightsFrom ||
            direction === constants.FORWARDS
          ) {
            req.session.alternativeBusFlightsFrom = transformedBusFlights;
          }

          req.session.startDate = startDate;
          req.session.endDate = endDate;
          req.session.currency = currency;
          req.session.adults = adults;
          req.session.children = children;
          req.session.originId = originId;
          req.session.destinationId = destinationId;
          req.session.isStarted = true;
          req.session.save(saveSessionCb);

        });
      }

      if (
        !req.session.alternativeBusFlightsFrom ||
        direction === constants.FORWARDS
      ) {
        req.session.alternativeBusFlightsFrom = transformedBusFlights;
      } else if (
        req.session.alternativeBusFlightsFrom ||
        direction === constants.BACKWARDS
      ) {
        req.session.alternativeBusFlightsTo = transformedBusFlights;
      }

      return req.session.save(saveSessionCb);

    } catch (err) {
      return next(err);
    }
  }
);

router.get("/available-dates", async (req, res, next) => {
  try {
    const {
      originId = null,
      destinationId = null,
      startDate = null,
    } = req?.query;

    const startDateInstance = new Date(startDate);
    let busFlights;

    let query = {
      attributes: ["id", "allSeats", "freeSeats", "routeId", "dateOfDeparture"],
      where: {
        freeSeats: {
          [Op.gte]: 1,
        },
        dateOfDeparture: {
          [Op.gte]: isValidDate(startDateInstance)
            ? startDateInstance
            : new Date(),
        },
      },
      include: [
        {
          model: RouteModel
        },
      ],
      order: [
        ["dateOfDeparture", "ASC"],
        ["routeId", "ASC"],
      ],
    };

    busFlights = await BusFlightModel.findAll(query);
    busFlights = busFlights?.map((bf) => bf?.toJSON());

    busFlights = filterBusFlightsAvailableDates(
      busFlights,
      originId,
      destinationId,
      isValidDate(startDateInstance)
    );

    return res.json({ status: "ok", data: busFlights });
  } catch (err) {
    return next(err);
  }
});

router.post("/select", [checkIfSessionIsStarted], async (req, res, next) => {
  try {
    const { id, isMain = true, direction = constants.FORWARDS } = req?.body;

    let selectedBusFlight = null;

    if (isMain) {
      selectedBusFlight = req.session?.busFlights?.find((el) => {
        return String(el?.id) === String(id);
      });
      selectedBusFlight.isSelected = true;
    } else {
      switch (direction) {
        case constants.FORWARDS: {
            
          const selectedBF = req.session?.alternativeBusFlightsFrom
            ?.find((el) => {
              return el?.[1].find((elem) => {
                return String(elem?.id) === String(id);
              });
            })?.[1]
            .find((el) => {
              return String(el?.id) === String(id);
            });

          
          selectedBusFlight = selectedBF;
      
          if(selectedBusFlight?.type !== constants.ROUND) {
            selectedBusFlight.isSelected = true;
          }

          break;
        }

        case constants.BACKWARDS: {
          const selectedBF = req.session?.alternativeBusFlightsTo
          ?.find((el) => {
            return el?.[1].find((elem) => {
              return String(elem?.id) === String(id);
            });
          })?.[1]
          .find((el) => {
            return String(el?.id) === String(id);
          });

          selectedBusFlight = req.session.selectedBusFlight;
          selectedBusFlight.isSelected = false;
          selectedBusFlight.busFlightToId = selectedBF.busFlightFromId;
          selectedBusFlight.places.to.routeId = selectedBF.places.from.routeId;
          selectedBusFlight.places.to.onBoardingPlace = selectedBF.places.from.onBoardingPlace;
          selectedBusFlight.places.to.outBoardingPlace = selectedBF.places.from.outBoardingPlace;
          selectedBusFlight.places.to.routeName = selectedBF.places.from.routeName;
          selectedBusFlight.places.to.onBoardingTime = selectedBF.places.from.onBoardingTime;
          selectedBusFlight.places.to.outBoardingTime = selectedBF.places.from.outBoardingTime;
          selectedBusFlight.dates.return = selectedBF.dates.departure;
          selectedBusFlight.dates.returnPure = selectedBF.dates.departurePure;
          selectedBusFlight.purePriceFull = String(Math.round(selectedBusFlight.purePriceFull) + Math.round(selectedBF.purePriceFull));
          selectedBusFlight.priceFull = selectedBusFlight.purePriceFull + selectedBF.priceFull.replace(/^\d+/gm, "");
          selectedBusFlight.purePrice = String(Math.round(selectedBusFlight.purePrice) + Math.round(selectedBF.purePrice));
          selectedBusFlight.price = selectedBusFlight.purePrice + selectedBF.price.replace(/^\d+/gm, "");
          selectedBusFlight.hasDiscount = selectedBusFlight.hasDiscount || selectedBF.hasDiscount;
          selectedBusFlight.discountPercentage = Number(Number(((selectedBusFlight.purePriceFull - selectedBusFlight.purePrice) / selectedBusFlight.purePriceFull) * 100).toFixed(1));

          if(selectedBusFlight.id.includes("alternative-ticket-from")) {
            selectedBusFlight.isSelected = true;
          }

          break;
        }

        default: {
          throw new Error();
        }
      }
    }

    if (!selectedBusFlight) {
      throw new Error();
    }

    req.session.selectedBusFlight = selectedBusFlight;
    req.session.startDate = selectedBusFlight.dates.departurePure;
    req.session.endDate = selectedBusFlight.dates.returnPure;

    // req.session.busFlights = null;

    req.session.save(function (err) {
      if (err) return next(err);

      return res.json({ status: "ok" });
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
