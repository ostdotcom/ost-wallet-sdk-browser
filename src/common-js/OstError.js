
import OstErrorMessages from './OstErrorMessages'
import OstErrorCodes from "./OstErrorCodes";

class OstError {
  constructor(internalErrorCode, errorCode, extraInfo) {
    this.internalErrorCode = internalErrorCode;
    this.errorCode = errorCode;
    this.extraInfo = extraInfo;
    this.isApiError = false;
  }

  IsApiError() {
    return this.isApiError;
  }

  setApiError(apiError) {
    this.isApiError = apiError;
  }

  //Getters
  getInternalErrorCode() {
    return this.internalErrorCode;
  }

  getErrorCode() {
    return this.errorCode;
  }

  getErrorMessage() {
    return OstErrorMessages[this.errorCode]
  }

  getExtraInfo() {
    return this.extraInfo;
  }

  setInternalErrorCode(internal_code) {
    this.internalErrorCode = internal_code;
  }

  setErrorCode(error_code) {
    this.errorCode = error_code;
  }

  static sdkError(error, internalErrorCode, errorCode) {
    if ( error instanceof OstError ) {
      //The error is already an OST error.
      if (internalErrorCode) {
        error.setInternalErrorCode(internalErrorCode);
      }

      if (errorCode) {
        error.setErrorCode(errorCode);
      }
     
      return error;
    }
    
    const errorInfo = {};
    errorInfo['error_obj'] = error;

    if (!internalErrorCode) {
      internalErrorCode = 'c-e-sdkerror';
    }

    if (!errorCode) {
      errorCode = OstErrorCodes.SKD_INTERNAL_ERROR;
    }

    error = new OstError(internalErrorCode, errorCode, errorInfo);

    return error;
  }

  getJSONObject() {
    return {
      internal_code: this.getInternalErrorCode(),
      error_code: this.getErrorCode(),
      error_message: this.getErrorMessage(),
      extra_info: this.getExtraInfo()
    }
  }
}

export default OstError;
