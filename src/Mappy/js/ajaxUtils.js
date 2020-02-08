// Promisified Jquery Ajax.
const ajaxUtils = {
  "get": (url, data) => {
    return ajaxUtils.api("GET", url, data);
  },

  "post": (url, data) => {
    return ajaxUtils.api("POST", url, data);
  },

  "api": (apiType, url, data) => {
    let _resolve, _reject;
    //Define Success Callback
    const successCallback = (response) => {
      if ( response && response.success ) {
        _resolve( response.data );
      } else {
        console.error("Api call responsed with error. \n", response.err, "\n url:", url);
        _reject( response.err );
      }
    };

    //Define Failuer Callback
    const failuerCallback = (error) => {
      console.error("Api call responsed with error. \n", error, "\n url:", url);
      _reject( error );
    };

    return new Promise((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;
      // Make Api call.
      $.ajax({
        type: apiType,
        url: url,
        data: data || {},
        success: successCallback,
        error: failuerCallback
      });
    });
  },

  "setupAjax": () => {
    $.ajaxSetup({
      type: "POST",
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true
    });
  
    $.ajaxSetup({
      type: "GET",
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true
    });
  }
};
export default ajaxUtils;