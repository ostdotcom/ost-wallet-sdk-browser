const config = require("../config.json");
const errorLogger = require("../utils/error_logger");

/**
 * Key Manager Response Handler
 * Adds Content Security Policy Headers to the response and triggers callback. 
 * The Caller must ensure this request is serving km-[mappy] resource.
 * 
 * @param  {Function} callback      As provided by the lambda function
 * @param  {[type]}   response      response object as present in event of lambda function.
 * @param  {[type]}   requestOrigin Origin of the request.
 * @param  {[type]}   requestPath   Path of the resource requested.
 * @return {null}                   Null.
 */
module.exports = (callback, response, requestOrigin, requestPath ) => {
  callback(null, response);
};