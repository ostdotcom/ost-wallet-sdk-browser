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
    constructor(internalErrorCode, errorCode, apiResponse){
        super(internalErrorCode,errorCode);
        super.setApiError(true);
        if(apiResponse){
            this.apiResponse = apiResponse;
            this.jsonApiError = this.apiResponse.data.err;
            super(internalErrorCode, errorCode, this.jsonApiError);
        }
    }

    getApiResponse() {
        return this.apiResponse || {};
    }

    getJsonApiError(){
        return this.jsonApiError || {};
    }

    getStatus(){
        return this.apiResponse.status;
    }

    getStatusText(){
        return this.apiResponse.statusText;
    }

    getApiInternalId(){
        return this.getJsonApiError().internal_id;
    }
    
    getApiErrorCode(){
        return this.getJsonApiError().code;
    }
    
    getApiErrorData(){
        return this.getJsonApiError().error_data;
    }
    
    getApiErrorMessage(){
        return this.getJsonApiError().msg;
    }
    
    isBadRequest(){
        return this.getApiErrorCode() == ErrorCodes.BAD_REQUEST;
    }
    
    isNotFound(){
        return this.getApiErrorCode() == ErrorCodes.NOT_FOUND;
    }

    isApiSignerUnauthorized(){
        return this.isErrorParameterKey( "api_key" );
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

}

export default OstApiError;
