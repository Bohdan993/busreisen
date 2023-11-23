const {
    Router
} = require("express");
const router = Router();

const {
    country: Country,
    countryattributes: CountryAttributes,
    currency: Currency,
    language: Language,
    cityattributes: CityAttributes,
    city: City
  } = require("../../database/models/index");

const { Op } = require("sequelize");

function mapCities(cities){
    let uniq = {};
    cities.forEach(city => {
        uniq[city?.country?.countryattrs?.[0]?.name] = city?.country;
    });
    let arr = Object.values(uniq);
    let resultCities = arr.map(el => {
        return {
            country: el,
            cities: [
                ...cities.filter(city => city?.country?.id === el?.id)
            ]
        }
    });

    return resultCities;
}

router.get("/", async (req, res, next) => {
    
    try {
        let cities = [];

        const {
            languageCode = "uk_UA", 
            mode = "html", 
            excludedCountry = null
        } = req?.query;
        
        if(!languageCode) {
            cities = await City.findAll({ include: { all: true}});
            return res.json({status: "ok", data: cities});
        }

        const lang = await Language.findOne({
            where: {
                code: {
                    [Op.eq]: languageCode
                }
            }
        });

        cities = await City.findAll({
            attributes: ["id"],
            include: [
                // {
                //     model: Language,
                //     where: {
                //         code: {
                //             [Op.eq]: lang?.id
                //         }
                //     },
                //     attributes: ["name", "code"],
                //     through: {
                //         attributes: []
                //     }
                // },
                {
                    model: Country,
                    attributes: ["id"],
                    where: {
                        id: {
                            [Op.ne]: excludedCountry
                        }
                    },
                    include: [
                    {
                        model: CountryAttributes,
                        as: "countryattrs",
                        attributes: ["name", "countryId", "languageId"],
                        where: {
                            languageId: {
                                [Op.eq]: lang?.id
                            }
                        }
                    }]
                },
                {
                    model: CityAttributes,
                    as: "cityattrs",
                    attributes: ["name", "cityId", "languageId"],
                    where: {
                        languageId: {
                            [Op.eq]: lang?.id
                        }
                    }

                },
                {
                    model: Currency,
                    attributes: ["abbr", "symbol"]
                }
            ],
            order: [
                [{model: Country}, {model: CountryAttributes, as: "countryattrs"},  "name", "DESC"],
                [{model: CityAttributes, as: "cityattrs"}, "name", "ASC"]
            ]

        });

        cities = cities?.map(city => city?.toJSON());
        const resultCities = mapCities(cities);


        if(mode?.toLowerCase() === "json") {
            return res.json({status: "ok", data: resultCities});
        }
        
        if(mode?.toLowerCase() === "html" || !mode) {
            return res.render("cities-dropdown", { data: resultCities });
        }

    } catch (err) {
        return next(err);
    }
    
});


module.exports = router