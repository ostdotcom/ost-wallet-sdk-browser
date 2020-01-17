
import OstErrorMessages from './OstErrorMessages'
import OstErrorCodes from "./OstErrorCodes";

class OstError {
  constructor(internalErrorCode, errorCode, extraInfo) {
    this.internalErrorCode = internalErrorCode;
    this.errorCode = errorCode;
    this.extraInfo = extraInfo;
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
}

export default OstError;
