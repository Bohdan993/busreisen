const express = require("express");
const fs = require("fs");
const https = require("https");
const RedisStore = require("connect-redis").default;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");
const { createClient } = require("redis");
const Fingerprint = require("express-fingerprint");
const path = require("path");
const validate = require("validate.js");
const compression = require('compression');
const helmet = require("helmet");

const app = express();

const keyCertPath = process.env.NODE_ENV === "development" ? path.resolve(__dirname, "../../localhost-key.pem") : null;
const certPath = process.env.NODE_ENV === "development" ? path.resolve(__dirname, "../../localhost.pem") : null;
const key = process.env.NODE_ENV === "development" ? fs.readFileSync(keyCertPath, "utf-8") : null;
const cert = process.env.NODE_ENV === "development" ? fs.readFileSync(certPath, "utf-8") : null;
const server = process.env.NODE_ENV === "development" ? https.createServer({key: key, cert: cert }, app) : null;


const authRoute = require("./routes/admin/auth");
const citiesRoute = require("./routes/cities");
const currenciesRoute = require("./routes/currency");
const busflightsRoute = require("./routes/busFlights");
const passengersRoute = require("./routes/passengers");
const translationsRoute = require("./routes/translations");
const paymentRoute = require("./routes/payment");
const ticketsRoute = require("./routes/tickets");
const sessionDataRoute = require("./routes/sessionData");

const { handleError } = require("../middlewares/errorMiddlewares");


// END TEMP VARIABLES
const PORT = process.env.PORT || 5000;
const redisClient = createClient();
redisClient.connect().catch(err => console.error("Redis", err));
const redisStore = new RedisStore({
    client: redisClient,
    prefix: "busreisen"
});
const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
const sessionOptions = {
    store: redisStore,
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: false,
    rolling: true,
    cookie: {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000,
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
app.set("view cache", true);
app.set('trust proxy', 1);
app.set('x-powered-by', false);

app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(Fingerprint());
app.use(session(sessionOptions));


app.use("/api/cities", citiesRoute);
app.use("/api/currencies", currenciesRoute);
app.use("/api/bus-flights", busflightsRoute);
app.use("/api/passengers", passengersRoute);
app.use("/api/tickets", ticketsRoute);
app.use("/api/translations", translationsRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/current-data", sessionDataRoute);

app.use("/api/admin/auth", authRoute);
// app.use("/api/admin/passengers", authRoute);
// app.use("/api/admin/bus-flights", authRoute);
// app.use("/api/admin/tickets", authRoute);
// app.use("/api/admin/users", authRoute);


app.use(handleError);



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

