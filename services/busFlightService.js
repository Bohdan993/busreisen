const { isSpecialDate, transformDate, isOneWay } = require("../helpers");


function filterBusFlights({busFlights, originId, destinationId, startDate, endDate}){
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


    result["resultFrom"] = resultFrom.filter(el => String(el?.dateOfDeparture) === String(startDate));
    
    result["resultTo"] = resultTo.filter(el => String(el?.dateOfDeparture) === String(endDate));


    
    if(!isSpecialDate(endDate) /*&& (result["resultFrom"].length !== result["resultTo"].length)*/) {
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
    const drezdenCityID = 12;
    const routeGroupIdForRemoval = 2;

    // Round trip   
    if((parseInt(originId) === drezdenCityID || parseInt(destinationId) === drezdenCityID) && !isSpecialDate(endDate)) {
        if(res["resultFrom"].some(el => parseInt(el?.route?.routePath?.routeGroupId) !== routeGroupIdForRemoval)) {
            res["resultFrom"] = res["resultFrom"].filter(el => parseInt(el?.route?.routePath?.routeGroupId) !== routeGroupIdForRemoval);
            res["resultTo"] = res["resultTo"].filter(el => parseInt(el?.route?.routePath?.routeGroupId) !== routeGroupIdForRemoval);
        }
    }
    
    // One way trip
    if((parseInt(originId) === drezdenCityID || parseInt(destinationId) === drezdenCityID) && isSpecialDate(endDate)) {
        if(res["resultFrom"].some(el => parseInt(el?.route?.routePath?.routeGroupId) !== routeGroupIdForRemoval)) {
            res["resultFrom"] = res["resultFrom"].filter(el => parseInt(el?.route?.routePath?.routeGroupId) !== routeGroupIdForRemoval);
        }
        
    }

    return res;  
}

function transformBusFlights({busFlights, cities, price, currency, originId, destinationId, endDate, startDate, languageCode}) {    
    let result = [];
    const cityFrom = cities?.filter(el => parseInt(el?.id) === parseInt(originId))?.[0];
    const cityTo = cities?.filter(el => parseInt(el?.id) === parseInt(destinationId))?.[0];


    busFlights?.resultFrom.forEach((el, ind) => {

        const onboardingPlaces = cityFrom?.places?.filter(elem => el?.route?.routePath?.onboarding.find(item => parseInt(elem.id) === parseInt(item?.placeId)));
        const outBoardingPlaces = cityTo?.places?.filter(elem => el?.route?.routePath?.outboarding.find(item => parseInt(elem.id) === parseInt(item?.placeId)));

        onboardingPlaces.forEach((onp, i) => {
            outBoardingPlaces.forEach((outp, j) => {
                let resultObj = {
                    "id": i + "-" + j,
                    "cities": {
                        "from": {
                            "name": cityFrom?.CityAttributes?.[0]?.name
                        },
                        "to": {
                            "name": cityTo?.CityAttributes?.[0]?.name
                        }
                    },
                    "places": {
                        "from": {
                            "routeId": el?.route?.id,
                            "routeName": el?.route?.routePath?.name,
                            "onBoardingPlace": onp?.PlaceAttributes?.[0]?.name,
                            "outBoardingPlace": outp?.PlaceAttributes?.[0]?.name,
                            "onBoardingTime": el?.route?.routePath?.onboarding?.find(el => parseInt(el?.placeId) === parseInt(onp?.id))?.time,
                            "outBoardingTime": el?.route?.routePath?.outboarding?.find(el => parseInt(el?.placeId) === parseInt(outp?.id))?.time,
                        },
                        "to": {
                            "routeId": busFlights?.resultTo?.[ind]?.route.id,
                            "routeName": busFlights?.resultTo?.[ind]?.route?.routePath?.name,
                            "onBoardingPlace": outp?.PlaceAttributes?.[0]?.name,
                            "outBoardingPlace": onp?.PlaceAttributes?.[0]?.name,
                            "onBoardingTime": busFlights?.resultTo?.[ind]?.route?.routePath?.onboarding?.find(el => parseInt(el?.placeId) === parseInt(outp?.id))?.time,
                            "outBoardingTime": busFlights?.resultTo?.[ind]?.route?.routePath?.outboarding?.find(el => parseInt(el?.placeId) === parseInt(onp?.id))?.time,
                        }
                    },
                    "purePrice": isOneWay(endDate) ? `${price?.priceOneWay}` : `${price?.priceRoundTrip}`,
                    "price": isOneWay(endDate) ? `${price?.priceOneWay} ${currency?.symbol}` : `${price?.priceRoundTrip} ${currency?.symbol}`,
                    "dates": {
                        "departure": transformDate(startDate, languageCode),
                        "return": transformDate(endDate, languageCode),
                    }
            
                };
        
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
    filterBusFlights,
    transformBusFlights,
    filterBusFlightsAvailableDates
}