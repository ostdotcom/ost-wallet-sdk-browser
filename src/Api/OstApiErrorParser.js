import OstError from "../common-js/OstError";
import OstApiError from "../common-js/OstApiError";
import OstErrorCodes from "../common-js/OstErrorCodes"

const LOG_TAG = "OstApiErrorParser";
const RESPONSE_SUCCESS = "success";
const RESPONSE_DATA = "data";
const DEFAULT_ERROR_MESSAGE = {'success': false, 
  'err': {
    'code': 'SOMETHING_WENT_WRONG', 
    'internal_id': 'SDK(SOMETHING_WENT_WRONG)', 
    'msg': '', 
    'error_data':[]
  }
};

class OstApiErrorParser {
  parse( error, apiParams ) {
    let request = error.request;
    let ostError;
    if ( !request ) {
      return null;
    }
    let apiResponse = this.getApiResponse( error );
    let apiErrorInfo = this.apiErrorInfoFor(error.request, apiResponse, apiParams);
    return new OstApiError("ost_api_error_parser_parse_1", OstErrorCodes.SDK_API_ERROR, apiErrorInfo);
  }

  getApiResponse( error ) {
    if (error.response && error.response.data && 'object' === error.response.data ) { 
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return error.response.data;
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest
      let responseText = error.request.responseText;
      let responseObject = null;

      try {
        if ( responseText && responseText.length > 0 ) {
          responseObject = JSON.parse( responseText );  
        }
      } catch( ex ) {
        // Likely received an Xml/Html.
      }

      if ( !responseObject ) {
        responseObject = this.getLocalApiResponse( error.request );
      }

      return responseObject;
    }
  }

  getLocalApiResponse( request ) {
    switch( Number(request.status) ) {
      case 502:
        return {'success': false, 'err': {'code': 'BAD_GATEWAY', 'internal_id': 'SDK(BAD_GATEWAY)', 'msg': '', 'error_data':[]}};
      case 503:
        return {'success': false, 'err': {'code': 'SERVICE_UNAVAILABLE', 'internal_id': 'SDK(SERVICE_UNAVAILABLE)', 'msg': '', 'error_data':[]}};
      case 504:
        return {'success': false, 'err': {'code': 'GATEWAY_TIMEOUT', 'internal_id': 'SDK(GATEWAY_TIMEOUT)', 'msg': '', 'error_data':[]}};
      default:
        return DEFAULT_ERROR_MESSAGE;
    }

  }


  apiErrorInfoFor(request, response, apiParams) {
    return {
      "url": request.responseURL,
      "status": request.status,
      "api_response": response,
      "api_params": apiParams
    };
  }

};
export default new OstApiErrorParser();
