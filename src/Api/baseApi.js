
import qs from 'qs';
import FormData from 'form-data';
import { response } from 'express';

let on401Callback = null;

export default class BaseApi {
    constructor(url) {
      this.url = url;
      this.defaultParams = {};
      this._cleanUrl();
      this._parseParams();
      this.formData = new FormData();
    }
    setFormData( data = null ) {
        if (data == '') {
          this.formData = {};
          return;
        }
    
        if (typeof data === 'object') {
          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              this.formData.append(key, data[key])
            }
          }
        }
      }


      get(res, q = '') {
        let query = typeof q !== 'string' ? qs.stringify(q) : q;
        this.parsedParams = Object.assign(this.parsedParams, {
          method: 'GET'
        });
        this.cleanedUrl += res;
        this.cleanedUrl += query.length > 0 ? (this.cleanedUrl.indexOf('?') > -1 ? `&${query}` : `?${query}`) : '';
    
        return this._perform();
      }
    
      post(res, body = '') {
        this.setFormData(body);
        this.parsedParams = Object.assign(this.parsedParams, {
          method: 'POST',
          body: this.formData
        });
        this.cleanedUrl += res;
        return this._perform();
      }
    
      _cleanUrl() {
        this.cleanedUrl = this.url;
      }
    
      _parseParams() {
        this.parsedParams = Object.assign(this.defaultParams);
      }
    
      
    
      _perform() {
        console.log("performing request");
        return new Promise(
          console.log(this.parsedParams.method)
        );
      }
    
      static clearCookies() {
        return new Promise(function (resolve) {
          console.log("Clearing cookies");
         
        });
      }
    
      clearCookies() {
        return BaseApi.clearCookies();
      }
}
    