const crypto = require("crypto");


function strToSign (str) {
    const sha1 = crypto.createHash("sha1");
    sha1.update(str);
    return sha1.digest("base64");
};

async function calculatePrice(
    {
        data
    } = {}
    ) {
    const passengersData = Object.entries(data || []);
    const calculatedPrice = passengersData.reduce(priceReducer, 0);

    function priceReducer (acc, curr) {    
        let currPassengerCount = curr?.[0].replace(/\D+/, "");
        const calcPrice = parseInt(curr?.[1]?.[`discount-ticket-price-${currPassengerCount}`]) || 0;
        return acc+= calcPrice;
    }

    return calculatedPrice;
};


module.exports = {
    calculatePrice,
    strToSign
}