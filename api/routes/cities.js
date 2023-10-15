const {
    Router
} = require("express");
const router = Router();
const City = require("../../models/city");
const LanguagesModel = require("../../models/language");
const CountriesModel = require("../../models/country");
const CountryAttributes = require("../../models/countryAttributes");
const CityAttributesModel = require("../../models/cityAttributes");
const CurrenciesModel = require("../../models/currency");
const { Op } = require("sequelize");


function mapCities(cities){
    let uniq = {};
    cities.forEach(city => {
        uniq[city?.country?.CountryAttributes?.[0]?.name] = city?.country;
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

router.get("/", async (req, res) => {
    
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

        const lang = await LanguagesModel.findOne({
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
                //     model: LanguagesModel,
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
                    model: CountriesModel,
                    attributes: ["id"],
                    where: {
                        id: {
                            [Op.ne]: excludedCountry
                        }
                    },
                    include: [
                    {
                        model: CountryAttributes,
                        attributes: ["name", "countryId", "languageId"],
                        where: {
                            languageId: {
                                [Op.eq]: lang?.id
                            }
                        }
                    }]
                },
                {
                    model: CityAttributesModel,
                    attributes: ["name", "cityId", "languageId"],
                    where: {
                        languageId: {
                            [Op.eq]: lang?.id
                        }
                    }

                },
                {
                    model: CurrenciesModel,
                    attributes: ["abbr", "symbol"]
                }
            ],
            order: [
                [{model: CountriesModel}, {model: CountryAttributes},  "name", "DESC"],
                [{model: CityAttributesModel}, "name", "ASC"]
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
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
    
});


module.exports = router