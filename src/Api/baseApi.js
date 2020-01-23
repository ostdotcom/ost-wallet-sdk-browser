
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

         /* $.ajax({
            type: 'POST',
            url: '/demo/api/1129/3213e2cfeed268d4ff0e067aa9f5f528d85bdf577e30e3a266f22556865db23a/users',
            data: {
               username: document.getElementById("usernameTb").value,
               password: document.getElementById("password").value
            },
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (jsonData) {
  
             return jsonData;
              
            },
            error: function (error) {
              console.log('Error loading username=' + document.getElementById("usernameTb").value + error);
            }
          })*/
          
        /*  $.post("/demo/api/1129/3213e2cfeed268d4ff0e067aa9f5f528d85bdf577e30e3a266f22556865db23a/login",
          {
            username: document.getElementById("usernameTb").value,
            password: document.getElementById("password").value
          },
          function (data, status) {
            document.getElementById("signupBtn").disabled = true;
            console.log("Data: " + data + "\nStatus: " + status);
            // Make another api call to fetch current user info.
            $.ajax({
              type: 'GET',
              url: '/demo/api/1129/3213e2cfeed268d4ff0e067aa9f5f528d85bdf577e30e3a266f22556865db23a/users',
              data: {
                 //username: document.getElementById("usernameTb").value,
                 //password: document.getElementById("password").value
              },
              contentType: 'application/json; charset=utf-8',
              dataType: 'json',
              success: function (jsonData) {
    
               // alert(jsonData.data.users[0].username);
                console.log(jsonData.data.users[0].token_id);
                //window.location.replace("/html/users.html");
                //document.getElementById("usersData").innerHTML='<object type="text/html" data="http://localhost:9000/src/html/Users.html" ></object>';
                //userData(jsonData);
                var pageNo=1;
                
                uploadUserData(jsonData,pageNo);
              },
              error: function (error) {
                console.log('Error loading username=' + document.getElementById("usernameTb").value + error);
              }
            });
          })*/ 
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
    