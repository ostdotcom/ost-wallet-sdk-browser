const config = require("../config.json");

exports.default = (LOG_TAG, message, error) => {
    let errorStack = "unavailable";
    if ( error.stack ) {
      errorStack = String( error.stack );
    }
    console.error(config.ALARM_LOG_TAG, LOG_TAG, message,"error.message", error.message, "error.stack",  errorStack);
};