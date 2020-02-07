
import '../css/login.css';
import OstSetup from "./common";

var ostSetup;
export class LoginSetup {
  constructor() {
    ostSetup = new OstSetup();
    this.getLoginStatus(function () {
      //if logged in Navigate to /users page.
      window.location = "/users";
  });
  }

  getLoginStatus( successCallback, failuerCallback ) {
    var baseUrl = ostSetup.getBaseUrl();
    console.log("base url --------->>>>>",baseUrl)
      $.ajax({
          type: 'GET',
          url: baseUrl+'/users',
          data: {
          },
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          success: function (jsonData) {
              successCallback && successCallback(jsonData);
          },
          error: function (error) {
            console.log('Error loading username=' + document.getElementById("usernameTb").value + error);
            failuerCallback && failuerCallback( error );
          }
        });
  }

  onClickLogin() {
    var baseUrl = ostSetup.getBaseUrl();
    document.getElementById("signupBtn").disabled = true;
    $("#signupBtn").attr("disabled", true);
    $.post(baseUrl+"/login", {
            username: document.getElementById("usernameTb").value,
            password: document.getElementById("password").value
        },
        function (data, status) {
          
            console.log("Data: " + data + "\nStatus: " + status);
            // Make another api call to fetch current user info.
            console.log(data.success);
            if(data.success==false){
              alert("INVALID USERNAME OR PASSWORD");
            }
            if(data.success==true) {
              ostSetup.setupDevice();
              window.location = "/users";
            } else {
                $("#signupBtn").removeAttr("disabled");
                // TODO: Display error on page.
                console.log("Issues logging in", error);
            }
        });
  }
}

$("#signupBtn").click(function () {
      loginSetup.onClickLogin();
   });

var loginSetup = new LoginSetup();
   