import OstErrorMessages from "./OstErrorMessages";

const codes = {};
for( let errorCode in OstErrorMessages ) { if ( OstErrorMessages.hasOwnProperty( errorCode ) ) {
    Object.defineProperty(codes, errorCode, {
        value: errorCode,
        writable: false
      });
}}

export default codes;

