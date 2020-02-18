
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

  static sdkError(error, internalErrorCode, errorCode) {
    if ( error instanceof OstError ) {
      //The error is already an OST error.
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

  static apiResponseError(apiResponse, internalErrorCode, errorCode) {
    if ( apiResponse instanceof OstError ) {
      return apiResponse;
    }
    const errorInfo = {};
    errorInfo['error_obj'] = apiResponse.response;

    if (!internalErrorCode) {
      internalErrorCode = 'c-e-apierror';
    }

    if (!errorCode) {
      errorCode = OstErrorCodes.SDK_API_ERROR;
    }

    apiResponse = new OstError(internalErrorCode, errorCode, errorInfo);

    return apiResponse;
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
