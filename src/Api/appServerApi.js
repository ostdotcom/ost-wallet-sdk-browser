import BaseApi from "./BaseApi";


export default class AppServerApi extends BaseApi{
    constructor(url) {
      super(url);
      this.defaultParams = {
        credentials: 'include',
        headers: {  
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };
    }

    thenFunction(res) {
        const success = res["success"];
    
        if (res && (success || success === 'true')) {
              return Promise.resolve( res["data"] )
        }
        return Promise.reject(res)
      }
    
      catchFunction(err) {
          return Promise.reject(err)
      }


    logIn(username, password) {
        let body = {username: username, password: password};
        let res ='/login';
        return this.post(res, body)
          .then(this.thenFunction)
          .catch(this.catchFunction);
      }

      registerDevice(deviceAddress, apiSignerAddress) {
        let body = {address: deviceAddress, api_signer_address: apiSignerAddress};
        let res ='/devices';
        return this.post(res, body)
          .then(this.thenFunction)
          .catch(this.catchFunction);
      }

      getCurrentUserTransactions(nextPayload) {
        let body = {page: nextPayload};
        let res ='/users/ledger';
        return this.get(res, body)
          .then(this.thenFunction)
          .catch(this.catchFunction)
      }

      getLoggedInUser() {
        let res ='/users/current-user';
        return this.get(res);
      }

      getUserList(nextPayload) {
        let body = {page: nextPayload};
        let res ='/users';
        return this.get(res, body)
          .then(this.thenFunction)
          .catch(this.catchFunction)
      }

      logoutUser() {
        let res = '/users/logout';
        const oThis = this;
        return this.post(res)
          .then(function(res) {
                    return oThis.clearCookies();
          })
          .catch(function (err) {
                    return oThis.clearCookies();
          });
      }
}