
const queryString = require('query-string');

class OstUrlHelper {

  static getStringToSign(url, params) {
    if (!params.hasOwnProperty('timestamp')) {
      params.timestamp = Date.now();
    }

    let stringifiedParams = queryString.stringify(params);

    let connector = '';
    if (!url.endsWith('/')) {
      connector = '/'
    }

    return url+connector+"?"+stringifiedParams;
  }


}

export default OstUrlHelper;