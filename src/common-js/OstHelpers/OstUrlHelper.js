const queryString = require('qs');

class OstUrlHelper {

  static getStringToSign(url, params) {

    if (!params.hasOwnProperty('timestamp')) {
      params.timestamp = Date.now();
    }

    let stringifiedParams = OstUrlHelper.getStringFromParams(params);

    let connector = '';
    if (!url.endsWith('/')) {
      // connector = '/';
    }

    return url + connector + "?" + stringifiedParams;
  }

  static getStringFromParams(params) {
    let stringifiedParams = queryString.stringify(params, {arrayFormat: 'brackets'});
    return stringifiedParams;
  }

  static getStringForOstApiSign(url, params) {

    let stringifiedParams = queryString.stringify(params, {
      arrayFormat: 'brackets', sort: function (a, b) {
        return a.localeCompare(b);
      }
    }).replace(/%20/g, '+');

    let connector = '';
    if (!url.endsWith('/')) {
      // connector = '/';
    }

    return url + connector + "?" + stringifiedParams;
  }


  static getParamsFromURL(searchParams) {
    let params = queryString.parse(searchParams, {arrayFormat: 'bracket', ignoreQueryPrefix: true});
    return params;
  }

  static deleteSignature(payload) {
    delete payload['signature'];
    return payload;
  }

  static appendSignature(urlString, signature) {
    return urlString + `&signature=${signature}`;
  }

}

export default OstUrlHelper;
