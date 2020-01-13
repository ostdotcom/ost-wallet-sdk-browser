
import OstErrorMessages from './OstErrorMessages'

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
}

export default OstError;
