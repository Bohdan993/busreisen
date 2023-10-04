const path = require("path");
const constants = require("./constants");
const fs = require("fs");

function isOneWay(date){
    return (String(date) === constants.ONE_WAY);
}

function isRound(date){
    return (String(date) === constants.ROUND);
}

function isSpecialDate(date){
    return (String(date) === constants.ONE_WAY || String(date) === constants.OPEN_DATE || String(date) === constants.ROUND);
}

function loadLanguageFile(fileName, languageCode) {
    return require(path.resolve("languages", languageCode, fileName));
}

function isValidDate(date){
    return date instanceof Date && !isNaN(date);
}
 
function transformDate(dateStr, languageCode = "uk_UA"){
    const translations = loadLanguageFile("ticket-list.js", languageCode)?.months;
    const d = new Date(dateStr);
    if(isValidDate(d)) {
        const month = translations?.[d.getMonth()];
        const day = (d.getDate() < 10) ? ("0" + d.getDate()) : d.getDate();
        const year = d.getFullYear();
    
        return `${month} ${day}, ${year}`;
    }

    return null;
}

function transformTimestampToDate(timestamp) {
    const d = new Date(timestamp);
    if(isValidDate(d)) {
        const month = ((d.getMonth() + 1) < 10) ? ("0" + (d.getMonth() + 1)) : (d.getMonth() + 1);
        const day = (d.getDate() < 10) ? ("0" + d.getDate()) : d.getDate();
        const year = d.getFullYear();

        return `${day}.${month}.${year}`;
    }

    return null;
}

function transformDateToShortString(date){

    if(date instanceof Date) {
        const month = ((date.getMonth() + 1) < 10) ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1);
        const day = (date.getDate() < 10) ? ("0" + date.getDate()) : date.getDate();
        return `${month}-${day}`;
    }

    return null;
}

function isEmptyObject(obj) {
    return Object.keys(obj).length === 0
}

function encodeHTMLEntities(rawStr) {
    return rawStr.replace(/[\u00A0-\u9999<>\&]/g, ((i) => `&#${i.charCodeAt(0)};`));
}

function decodeHTMLEntities(rawStr) {
    return rawStr.replace(/&#(\d+);/g, ((match, dec) => `${String.fromCharCode(dec)}`));
}

function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return Buffer.from(bitmap).toString('base64');
}

 module.exports = {
    isSpecialDate,
    isOneWay,
    isRound,
    transformDate,
    loadLanguageFile,
    isValidDate,
    transformDateToShortString,
    isEmptyObject,
    transformTimestampToDate,
    encodeHTMLEntities,
    decodeHTMLEntities,
    base64_encode
 }