
import OstErrorMessages from './OstErrorMessages'
import OstErrorCodes from "./OstErrorCodes";

class OstError {
  constructor(internalErrorCode, errorCode, extraInfo) {
    this.internalErrorCode = internalErrorCode;
    this.errorCode = errorCode;
    this.extraInfo = extraInfo || {};
  }

  isApiError() {
    return false;
  }

  setApiError(apiError) {
    this._isApiError = apiError;
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
      return error;
    }
    if ( typeof error !== 'object') {
      error = new Error( error );
    }

    const errorInfo = error;
    if ( error instanceof Error) {
      errorInfo['error_obj'] = {
        "is_js_error": true,
        "message": error.message,
        "name": error.name
      };
    }

    if (!internalErrorCode) {
      internalErrorCode = 'c-e-sdkerror';
    }

    if (!errorCode) {
      errorCode = OstErrorCodes.SKD_INTERNAL_ERROR;
    }

    return new OstError(internalErrorCode, errorCode, errorInfo);
  }

  static fromErrorPayload( errorPayload ) {
    return new OstError(
        errorPayload.internal_error_code, 
        errorPayload.error_code,
        errorPayload.extra_info
      );
  }

  getJSONObject() {
    return {
      is_ost_error_payload: true,
      internal_error_code: this.getInternalErrorCode(),
      error_code: this.getErrorCode(),
      error_message: this.getErrorMessage(),
      extra_info: this.getExtraInfo(),
      is_ost_api_error_payload: this.isApiError()
    };
  }
}

export default OstError;
