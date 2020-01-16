
const queryString = require('qs');

class OstUrlHelper {

  static getStringToSign(url, params) {

    if (!params.hasOwnProperty('timestamp')) {
      params.timestamp = Date.now();
    }

    let stringifiedParams = queryString.stringify(params, { arrayFormat: 'brackets' });

    let connector = '';
    if (!url.endsWith('/')) {
      connector = '/';
    }

    return url+connector+"?"+stringifiedParams;
  }

  static getParamsFromURL(location) {
    let params = queryString.parse(location.search, {arrayFormat: 'bracket', ignoreQueryPrefix: true});
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