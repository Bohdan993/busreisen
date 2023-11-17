const { customRoutesFilterMap } = require("../extra");
const { isSpecialDate, transformDate, isOneWay, isRound, isOpenDate } = require("../helpers");
const constants = require("../helpers/constants");



function filterBusFlightsWithFreeSeats({busFlights, numOfPassengers}){
    return busFlights.filter(bf => {
        return parseInt(bf.freeSeats) >= parseInt(numOfPassengers);
    });
}

function filterBusFlights({ 
    busFlights, 
    originId,
    destinationId, 
    startDate, 
    endDate, 
    customRoutesFilter = (arg) => arg,
    isAlternativeBusFlights = false 
    } = {}){
    let resultTo = [];
    let resultFrom = [];
    let result = {};

    busFlights.forEach(busFlight => {
        let routePath = busFlight?.route?.routePath;

        if(routePath) {
            if(typeof routePath === "string") {
                ///////
                routePath = JSON.parse(routePath);
            }
            let onboarding = routePath?.onboarding;
            let outboarding = routePath?.outboarding;

            let originFrom = onboarding.find(el => parseInt(el?.cityId) === parseInt(originId));
            let destinationFrom = outboarding.find(el => parseInt(el?.cityId) === parseInt(destinationId));

            if(originFrom && destinationFrom) {
                
                busFlight.route.routePath.onboarding = onboarding.filter(el => parseInt(el?.cityId) === parseInt(originId));
                busFlight.route.routePath.outboarding = outboarding.filter(el => parseInt(el?.cityId) === parseInt(destinationId));
                resultFrom.push(busFlight);
            }

            let originTo = onboarding.find(el => parseInt(el?.cityId) === parseInt(destinationId));
            let destinationTo = outboarding.find(el => parseInt(el?.cityId) === parseInt(originId));

            if(originTo && destinationTo) {
                busFlight.route.routePath.onboarding = onboarding.filter(el => parseInt(el?.cityId) === parseInt(destinationId));
                busFlight.route.routePath.outboarding = outboarding.filter(el => parseInt(el?.cityId) === parseInt(originId));
                resultTo.push(busFlight);
            }
        }

    });


    

    // for comparing string use localCompare
    if(isAlternativeBusFlights) {
        result["resultFrom"] = resultFrom.filter(el => String(el?.dateOfDeparture) > String(startDate));
        result["resultTo"] = resultTo.filter(el => String(el?.dateOfDeparture) > String(endDate));
    } else {
        result["resultFrom"] = resultFrom.filter(el => String(el?.dateOfDeparture) === String(startDate));
        result["resultTo"] = resultTo.filter(el => String(el?.dateOfDeparture) === String(endDate));
    }


    if(!isSpecialDate(endDate) && !isAlternativeBusFlights /*&& (result["resultFrom"].length !== result["resultTo"].length)*/) {
        result = selectBusFlights(result, customRoutesFilter.bind(null, originId, destinationId, endDate));
    } else {
        result = customRoutesFilter(originId, destinationId, endDate, result);
    }
    
    return result;
}

function selectBusFlights(data, customRouteFilter = (arg) => arg) {
    let result = {};
    let resultTo = [];
    let resultFrom = [];

    if(data?.resultFrom?.length > data?.resultTo?.length) {
        data?.resultTo.forEach(rt => {
            const routeGroupId = rt?.route?.routePath?.routeGroupId;
            for(let i = 0; i < data?.resultFrom?.length; i++) {
                if(routeGroupId === data?.resultFrom?.[i].route?.routePath?.routeGroupId) {
                    resultTo.push(rt);
                    resultFrom.push(data?.resultFrom?.[i]);
                    data?.resultFrom.splice(i, 1);
                    break;
                }
            }
        });
    } else {
        data?.resultFrom.forEach(rf => {
            const routeGroupId = rf?.route?.routePath?.routeGroupId;
            for(let i = 0; i < data?.resultTo?.length; i++) {
                if(routeGroupId === data?.resultTo?.[i].route?.routePath?.routeGroupId) {
                    resultFrom.push(rf);
                    resultTo.push(data?.resultTo?.[i]);
                    data?.resultTo.splice(i, 1);
                    break;
                }
            }
        });
    }

    result["resultFrom"] = resultFrom;
    result["resultTo"] = resultTo;


    result = customRouteFilter(result);
    return result;
}

function customRoutesFilter(originId, destinationId, endDate, res){
    // const cityIds = [12];
    // const routeGroupIdsForRemoval = [2];

    // const map = {
    //     /** cityId: [routeGroupIdsForRemoval] */
    //     12: [2]
    // }

    // Round trip   
    if(customRoutesFilterMap.hasOwnProperty(parseInt(originId)) || customRoutesFilterMap.hasOwnProperty(parseInt(destinationId)) && !isSpecialDate(endDate)) {
        const key = customRoutesFilterMap.hasOwnProperty(parseInt(originId)) ? parseInt(originId) : parseInt(destinationId);

        /**
         * If at least one route exists that shouldn't be removed than code inside @if statement executes
         */   

        if(res["resultFrom"].some(handleCb.bind(null, key))) {
           res["resultFrom"] = res["resultFrom"].filter(handleCb.bind(null, key));
           res["resultTo"] = res["resultTo"].filter(handleCb.bind(null, key));
        }
    
        return res;
     }
    
    // One way trip
    if(customRoutesFilterMap.hasOwnProperty(parseInt(originId)) || customRoutesFilterMap.hasOwnProperty(parseInt(destinationId)) && isSpecialDate(endDate)) {
        const key = customRoutesFilterMap.hasOwnProperty(parseInt(originId)) ? parseInt(originId) : parseInt(destinationId);

        /**
         * If at least one route exists that shouldn't be removed than code inside @if statement executes
         */
        if(res["resultFrom"].some(handleCb.bind(null, key))) {
            res["resultFrom"] = res["resultFrom"].filter(handleCb.bind(null, key));
        }
    
        return res;
     }

    
    function handleCb (key, el){ 
        return !(customRoutesFilterMap[key].includes(parseInt(el?.route?.routePath?.routeGroupId)));
    }
    
    return res;  
}

function calcBusFlightPrice({
    el,
    ind,
    price,
    busFlights,
    originId,
    destinationId
} = {}){
    const priceForwards = price.find(el => parseInt(el?.firstCityId) ===  parseInt(originId));
    const priceBackwards = price.find(el => parseInt(el?.firstCityId) ===  parseInt(destinationId));

    
    const calcPrice = (el?.discount || busFlights?.resultTo?.[ind]?.discount) ? {
        ...priceForwards,
        "priceOneWay": Math.round(priceForwards.priceOneWay * (1 - parseFloat(el?.discount?.coef || 0))),
        "priceOneWayFull": priceForwards.priceOneWay,
        "priceRoundTrip": Math.round((priceForwards.priceRoundTrip / 2) * (1 - parseFloat(el?.discount?.coef || 0)) + 
        (priceBackwards.priceRoundTrip / 2) * (1 - parseFloat(busFlights?.resultTo?.[ind]?.discount?.coef || 0))),
        "priceRoundTripFull": Math.round((priceForwards.priceRoundTrip / 2)) + Math.round((priceBackwards.priceRoundTrip / 2)),
        "alternativeOneHalfRoundTripPrice": Math.round((priceForwards.priceRoundTrip / 2) * (1 - parseFloat(el?.discount?.coef || 0))),
        "alternativeOneHalfRoundTripPriceFull": Math.round((priceForwards.priceRoundTrip / 2))
    } : {
        ...priceForwards,
        "priceOneWayFull": priceForwards.priceOneWay,
        "priceRoundTripFull": Math.round((priceForwards.priceRoundTrip / 2)) + Math.round((priceBackwards.priceRoundTrip / 2)),
        "alternativeOneHalfRoundTripPrice": Math.round((priceForwards.priceRoundTrip / 2)),
        "alternativeOneHalfRoundTripPriceFull": Math.round((priceForwards.priceRoundTrip / 2))
    };

    return calcPrice;
}

function transformBusFlights(
    {
        busFlights, 
        cities, 
        price, 
        currency, 
        originId, 
        destinationId, 
        endDate, 
        // startDate, 
        languageCode, 
        isAlternativeBusFlights = false,
        direction = constants.FORWARDS
    }) { 

    let result = [];
    const cityFrom = cities?.filter(el => parseInt(el?.id) === parseInt(originId))?.[0];
    const cityTo = cities?.filter(el => parseInt(el?.id) === parseInt(destinationId))?.[0];

    busFlights?.resultFrom.forEach((el, ind) => {
        
        const onboardingPlaces = cityFrom?.places?.filter(elem => el?.route?.routePath?.onboarding.find(item => parseInt(elem.id) === parseInt(item?.placeId)));
        const outBoardingPlaces = cityTo?.places?.filter(elem => el?.route?.routePath?.outboarding.find(item => parseInt(elem.id) === parseInt(item?.placeId)));
        
        onboardingPlaces.forEach((onp, i) => {
            outBoardingPlaces.forEach((outp, j) => {
                
                const calcPrice = calcBusFlightPrice({el, ind, price, busFlights, originId, destinationId});

                let resultObj = {
                    "id": !isAlternativeBusFlights ? "main-ticket-" + ind + "-" + i + "-" + j : 
                        direction === constants.FORWARDS ? 
                            "alternative-ticket-from-" + ind + "-" + i + "-" + j : 
                            "alternative-ticket-to-" + ind + "-" + i + "-" + j,
                    "type": (!(isSpecialDate(endDate)) || isRound(endDate)) ? constants.ROUND : isOneWay(endDate) ? constants.ONE_WAY : constants.OPEN_DATE,
                    "busFlightFromId": el?.id,
                    "busFlightToId": busFlights?.resultTo?.[ind]?.id || null,
                    "cities": {
                        "from": {
                            "id": cityFrom?.id,
                            "name": cityFrom?.cityattrs?.[0]?.name
                        },
                        "to": {
                            "id": cityTo?.id,
                            "name": cityTo?.cityattrs?.[0]?.name
                        }
                    },
                    "places": {
                        "from": {
                            "routeId": el?.route?.id,
                            "routeName": el?.route?.routeattrs?.[0]?.name,
                            "onBoardingPlace": onp?.placeattrs?.[0]?.name,
                            "outBoardingPlace": outp?.placeattrs?.[0]?.name,
                            "onBoardingTime": el?.route?.routePath?.onboarding?.find(el => parseInt(el?.placeId) === parseInt(onp?.id))?.time,
                            "outBoardingTime": el?.route?.routePath?.outboarding?.find(el => parseInt(el?.placeId) === parseInt(outp?.id))?.time,
                        },
                        "to": {
                        }
                    },
                    "dates": {
                    },
                    "hasDiscount": !!(el?.discount) || !!(busFlights?.resultTo?.[ind]?.discount),
                    "discountPercentage": ((!(isSpecialDate(endDate)) || isRound(endDate) || isOpenDate(endDate)) && !isAlternativeBusFlights) || isOpenDate(endDate) && isAlternativeBusFlights ? 
                    (((Number(el?.discount?.coef || 0) * 100) + (Number(busFlights?.resultTo?.[ind]?.discount?.coef || 0) * 100)) / 2) : 
                    (Number(el?.discount?.coef || 0) * 100)
                };


                if(isAlternativeBusFlights) {
                    resultObj.purePriceFull = (!(isSpecialDate(endDate)) || isRound(endDate)) ? `${calcPrice?.alternativeOneHalfRoundTripPriceFull}` : isOneWay(endDate) ? `${calcPrice?.priceOneWayFull}` : `${calcPrice?.priceRoundTripFull}`;
                    resultObj.purePrice = (!(isSpecialDate(endDate)) || isRound(endDate)) ? `${calcPrice?.alternativeOneHalfRoundTripPrice}` : isOneWay(endDate) ? `${calcPrice?.priceOneWay}` : `${calcPrice?.priceRoundTrip}`;
                    resultObj.priceFull = (!(isSpecialDate(endDate)) || isRound(endDate)) ? `${calcPrice?.alternativeOneHalfRoundTripPriceFull} ${currency?.symbol}` : isOneWay(endDate) ? `${calcPrice?.priceOneWayFull} ${currency?.symbol}` : `${calcPrice?.priceRoundTripFull} ${currency?.symbol}`;
                    resultObj.price = (!(isSpecialDate(endDate)) || isRound(endDate)) ? `${calcPrice?.alternativeOneHalfRoundTripPrice} ${currency?.symbol}` : isOneWay(endDate) ? `${calcPrice?.priceOneWay} ${currency?.symbol}` : `${calcPrice?.priceRoundTrip} ${currency?.symbol}`;
                    resultObj.dates.departure = transformDate(el?.dateOfDeparture, languageCode);
                    resultObj.dates.departurePure = el?.dateOfDeparture;
                    resultObj.dates.return = busFlights?.resultTo?.length ? transformDate(busFlights?.resultTo?.[ind]?.dateOfDeparture, languageCode) : transformDate(endDate, languageCode);
                    resultObj.dates.returnPure = busFlights?.resultTo?.length ? busFlights?.resultTo?.[ind]?.dateOfDeparture : endDate;
                } else {
                    if(!isSpecialDate(endDate)) {
                        resultObj.places.to.routeId = busFlights?.resultTo?.[ind]?.route.id;
                        resultObj.places.to.routeName =  busFlights?.resultTo?.[ind]?.route?.routeattrs?.[0]?.name;
                        resultObj.places.to.onBoardingPlace =  outp?.placeattrs?.[0]?.name;
                        resultObj.places.to.outBoardingPlace = onp?.placeattrs?.[0]?.name;
                        resultObj.places.to.onBoardingTime =  busFlights?.resultTo?.[ind]?.route?.routePath?.onboarding?.find(el => parseInt(el?.placeId) === parseInt(outp?.id))?.time;
                        resultObj.places.to.outBoardingTime = busFlights?.resultTo?.[ind]?.route?.routePath?.outboarding?.find(el => parseInt(el?.placeId) === parseInt(onp?.id))?.time;
                    }

                    resultObj.purePriceFull = isOneWay(endDate) ? `${calcPrice?.priceOneWayFull}` : `${calcPrice?.priceRoundTripFull}`;
                    resultObj.purePrice = isOneWay(endDate) ? `${calcPrice?.priceOneWay}` : `${calcPrice?.priceRoundTrip}`;
                    resultObj.priceFull = isOneWay(endDate) ? `${calcPrice?.priceOneWayFull} ${currency?.symbol}` : `${calcPrice?.priceRoundTripFull} ${currency?.symbol}`;
                    resultObj.price = isOneWay(endDate) ? `${calcPrice?.priceOneWay} ${currency?.symbol}` : `${calcPrice?.priceRoundTrip} ${currency?.symbol}`;
                    resultObj.dates.departure = transformDate(el?.dateOfDeparture, languageCode);
                    resultObj.dates.departurePure = el?.dateOfDeparture;
                    resultObj.dates.return = busFlights?.resultTo?.length ? transformDate(busFlights?.resultTo?.[ind]?.dateOfDeparture, languageCode) : transformDate(endDate, languageCode);
                    resultObj.dates.returnPure = busFlights?.resultTo?.length ? busFlights?.resultTo?.[ind]?.dateOfDeparture : endDate;
                }
        
                result.push(resultObj);
            });
        });

    });

    return result;
}

function filterBusFlightsAvailableDates(busFlights, originId, destinationId, isStartDate){
    let result = [];
    busFlights.forEach(busFlight => {
        if(busFlight?.route?.routePath?.onboarding?.find(el => parseInt(el?.cityId) === parseInt(originId))) {
            result.push(busFlight);
        }

        if(busFlight?.route?.routePath?.outboarding?.find(el => parseInt(el?.cityId) === parseInt(destinationId))) {
            result.push(busFlight);
        }
    });

    return isStartDate ? 
    Array.from(new Set(result.map(el => el?.dateOfDeparture))).slice(1) : 
    Array.from(new Set(result.map(el => el?.dateOfDeparture)));
}

module.exports = {
    customRoutesFilter,
    filterBusFlightsWithFreeSeats,
    filterBusFlights,
    transformBusFlights,
    filterBusFlightsAvailableDates
}