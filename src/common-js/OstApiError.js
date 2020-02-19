import OstError from './OstError';

const ErrorCodes = {
  UNAUTHORISED: "UNAUTHORISED",
  BAD_REQUEST : "BAD_REQUEST" ,
  AUTHENTICATION_ERROR : "AUTHENTICATION_ERROR",
  NOT_FOUND : "NOT_FOUND" ,
  INSUFFICIENT_FUNDS : "INSUFFICIENT_FUNDS" ,
  UNPROCESSABLE_ENTITY : "UNPROCESSABLE_ENTITY",
  INTERNAL_SERVER_ERROR : "INTERNAL_SERVER_ERROR",
  AUTHORIZATION_ERROR : "AUTHORIZATION_ERROR",
  REQUEST_TIMEOUT : "REQUEST_TIMEOUT",
  UNSUPPORTED_VERSION : "UNSUPPORTED_VERSION",
  TOO_MANY_REQUESTS : "TOO_MANY_REQUESTS",
  ALREADY_EXISTS : "ALREADY_EXISTS"
};
  

class OstApiError extends OstError {
  constructor(internalErrorCode, errorCode, apiErrorInfo){
    super(internalErrorCode,errorCode);
    this.extraInfo = this.extraInfo || {};
    this.extraInfo.api_error_info = apiErrorInfo;
  }

  isApiError() {
    return true;
  }

  getApiErrorInfo() {
    let extraInfo = this.getExtraInfo();
    if ( !extraInfo ) {
      return null;
    }
    return extraInfo.api_error_info;
  }

  getResponseStatusCode() {
    let apiErrorInfo = this.getApiErrorInfo();
    if ( !apiErrorInfo ) {
      return null;
    }
    return apiErrorInfo.status;
  }

  getRequestUrl() {
    let apiErrorInfo = this.getApiErrorInfo();
    if ( !apiErrorInfo ) {
      return null;
    }
    return apiErrorInfo.url;
  }

  getApiResponse() {
    let apiErrorInfo = this.getApiErrorInfo();
    if ( !apiErrorInfo ) {
      return null;
    }
    return apiErrorInfo.api_response;
  }

  getJsonApiError() {
    let apiResponse = this.getApiResponse();
    if ( !apiResponse ) {
      return null;
    }
    return apiResponse.err;
  }

  getApiInternalId() {
    return this.getJsonApiError().internal_id;
  }
  
  getApiErrorCode() {
    return this.getJsonApiError().code;
  }
  
  getApiErrorData() {
    return this.getJsonApiError().error_data;
  }
  
  getApiErrorMessage() {
    return this.getJsonApiError().msg;
  }
  
  isBadRequest() {
    return this.getApiErrorCode() == ErrorCodes.BAD_REQUEST;
  }
  
  isNotFound() {
    return this.getApiErrorCode() == ErrorCodes.NOT_FOUND;
  }

  isApiSignerUnauthorized() {
    return this.isErrorParameterKey( "api_key" );
  }

  isDeviceTimeOutOfSync(){
    return this.isErrorParameterKey( "api_request_timestamp" );
  }
  
  isErrorParameterKey( key ){
    if(!key) return false ;
    let errorData = this.getApiErrorData() || [];
    for(let cnt = 0 ; cnt < errorData.length ; cnt++){
      let parameter =  errorData[cnt]['parameter'];
      if( parameter && parameter.toLowerCase() ==  key.toLowerCase() ){
        return true ;
      }
    }
    return false ;
  }

  static fromApiErrorPayload( errorPayload ) {
    if ( errorPayload.is_ost_error_payload && errorPayload.is_ost_api_error_payload ) {
        return new OstApiError(
            errorPayload.internal_error_code, 
            errorPayload.error_code,
            errorPayload.extra_info.api_error_info
          );        
    }
    return OstError.fromErrorPayload( errorPayload );
  }

}

export default OstApiError;
