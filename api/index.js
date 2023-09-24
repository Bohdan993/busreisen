const express = require("express");
const fs = require("fs");
const https = require("https");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const { createClient } = require("redis");
const Fingerprint = require("express-fingerprint");
const path = require("path");
const validate = require("validate.js");

const app = express();

const keyCertPath = process.env.NODE_ENV === "development" ? path.resolve(__dirname, "../../localhost-key.pem") : null;
const certPath = process.env.NODE_ENV === "development" ? path.resolve(__dirname, "../../localhost.pem") : null;
const key = process.env.NODE_ENV === "development" ? fs.readFileSync(keyCertPath, "utf-8") : null;
const cert = process.env.NODE_ENV === "development" ? fs.readFileSync(certPath, "utf-8") : null;
const server = process.env.NODE_ENV === "development" ? https.createServer({key: key, cert: cert }, app) : null;


const authRoute = require("./routes/auth");
const citiesRoute = require("./routes/cities");
const currenciesRoute = require("./routes/currency");
const busflightsRoute = require("./routes/busFlights");
const passangersRoute = require("./routes/passangers");
const translationsRoute = require("./routes/translations");
const paymentRoute = require("./routes/payment");
const ticketsRoute = require("./routes/tickets");
const sessionData = require("./routes/sessionData");

// TEMP VARIABLES
const Language = require("../models/language");
const languages = require("../data/languages");

const Country = require("../models/country");
const countries = require("../data/countries");

const CountryAttributes = require("../models/countryAttributes");
const countryAttributes = require("../data/countryAttributes");

const City = require("../models/city");
const cities = require("../data/cities");

const CityAttributes = require("../models/cityAttributes");
const cityAttributes = require("../data/cityAttributes");

const Place = require("../models/place");
const places = require("../data/places");

const PlaceAttributes = require("../models/placeAttributes");
const placeAttributes = require("../data/placeAttributes");

const Route = require("../models/route");
const routes = require("../data/routes");

const Currency = require("../models/currency");
const currencies = require("../data/currencies");

const BusFlight = require("../models/busFlight");
const busFlights = require("../data/busFlights");

const BusFlightPrices = require("../models/busFlightPrices");
const busFlightPrices = require("../data/busFlightPrices");

const Discount = require("../models/discount");
const discounts = require("../data/discounts");

const DiscountAttributes = require("../models/discountAttributes");
const discountAttributes = require("../data/discountAttributes");

const UserTicket = require("../models/userTicket");

const { sendTestMail } = require("../services/mailService");


// END TEMP VARIABLES
const PORT = process.env.PORT || 5000;
const redisClient = createClient();
// redisClient.connect().catch(err => console.error("Redis", err));
const redisStore = new RedisStore({
    client: redisClient
});
const corsOptions = {
    // origin: "https://tg-bot-kod-git-working-bohdan993.vercel.app",
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
const sessionOptions = {
    // store: redisStore,
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: false,
    // maxAge: 15 * 60 * 1000,
    rolling: true,
    cookie: {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 180 * 60 * 1000,
        path: '/'
    }
};


validate.extend(validate.validators.datetime, {
    parse: function(value, options) {
        const timestamp = +new Date(value);
        return timestamp;
    },
    // Input is a unix timestamp
    format: function(value, options) {
        return new Date(value).toLocaleDateString().replace(/[\.\/]/g, "-");
    }
});

app.set("views", path.resolve("views"));
app.set("view engine", "pug");
// app.set("view cache", true);
app.set('trust proxy', 1);

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(Fingerprint());
app.use(session(sessionOptions));

app.use("/api/auth", authRoute);
app.use("/api/cities", citiesRoute);
app.use("/api/currencies", currenciesRoute);
app.use("/api/bus-flights", busflightsRoute);
app.use("/api/passangers", passangersRoute);
app.use("/api/tickets", ticketsRoute);
app.use("/api/translations", translationsRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/current-data", sessionData);

app.use("/api/test-mail", async (req, res) => {
    try {
        const {
            email
        } = req?.query;
        await sendTestMail(email);
        res.json({status: "ok"});
    } catch(err){
        res.status(500).json({status: "fail"});
    }
});



app.use("/api/insert-values", async function(req, res, next) {
    try {  

        async function run(){
            for (const language of languages) {
                await Language.create({
                    "name": language?.name,
                    "code": language?.code
                });
            }

            for (const country of countries) {
                await Country.create({
                    "id": country?.id
                });
            }

            for(const countryAttribute of countryAttributes) {
                await CountryAttributes.create({
                    "name": countryAttribute?.name,
                    "countryId": countryAttribute?.countryId,
                    "languageId": countryAttribute?.languageId
                });
            }

            for(const city of cities) {
                await City.create({
                    "id": city?.id,
                    "countryId": city?.countryId
                });
            }

            for(const cityAttribute of cityAttributes) {
                await CityAttributes.create({
                    "name": cityAttribute?.name,
                    "cityId": cityAttribute?.cityId,
                    "languageId": cityAttribute?.languageId
                });
            }

            for(const place of places) {
                await Place.create({
                    "id": place?.id,
                    "cityId": place?.cityId
                });
            }

            for(const placeAttribute of placeAttributes) {
                await PlaceAttributes.create({
                    "name": placeAttribute?.name,
                    "placeId": placeAttribute?.placeId,
                    "languageId": placeAttribute?.languageId
                });
            }

            for(const route of routes) {
                await Route.create({
                    "routePath": route
                });
            }

            for(const currency of currencies) {
                await Currency.create({
                    "name": currency?.name,
                    "abbr": currency?.abbr,
                    "symbol": currency?.symbol,
                    "isBaseCurrency": currency?.isBaseCurrency,
                    "coef": currency?.coef
                });
            }

            for(const busFlight of busFlights) {
                await BusFlight.create({
                    "allSeats": busFlight?.allSeats,
                    "freeSeats": busFlight?.freeSeats,
                    "routeId": busFlight?.routeId,
                    "dateOfDeparture": busFlight?.dateOfDeparture
                });
            }

            for(const busFlightPrice of busFlightPrices) {
                await BusFlightPrices.create({
                    "priceOneWay": busFlightPrice?.priceOneWay,
                    "priceRoundTrip": busFlightPrice?.priceRoundTrip,
                    "firstCityId": busFlightPrice?.firstCityId,
                    "secondCityId": busFlightPrice?.secondCityId,
                    "currencyId": busFlightPrice?.currencyId
                });
            }

            for(const discount of discounts) {
                await Discount.create({
                    "id": discount?.id,
                    "coef": discount?.coef,
                    "inactivePeriod": discount?.inactivePeriod,
                    "busflightId": discount?.busflightId
                });
            }

            for(const discountAttribute of discountAttributes) {
                await DiscountAttributes.create({
                    name: discountAttribute?.name,
                    discountId: discountAttribute?.discountId,
                    languageId: discountAttribute?.languageId,
                    group: discountAttribute?.group
                });
            }
        }
        await run();
        return res.json({status: "ok", data: "ok"});
    } catch (err) {
        console.log("ERR", err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
});


async function start(){
    if(process.env.NODE_ENV === "development") {
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } else {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
}


module.exports = {
    start
}

