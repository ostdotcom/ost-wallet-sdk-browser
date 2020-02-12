import '../css/login.css';
import OstSetup from "./common";

var ostSetup;
export class LoginSetup {
  constructor() {
    const oThis = this;
    ostSetup = new OstSetup();
    this.getLoginStatus(function () {
      //if logged in Navigate to /users page.
      window.location = "/sdk-getters";
    });
    oThis.bindEvents();
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

  bindEvents() {
    const oThis = this;
    $(function () {
      $("#signupBtn").click(function () {
        console.log("login");
        oThis.onClickLogin();
     });
    })
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
					  if(data.success) {
						  ostSetup.setupDevice();
						  window.location = "/sdk-getters";
						}
						else {
							alert("INVALID USERNAME OR PASSWORD");
							// TODO: Display error on page.
							// console.log("Issues logging in", error);
						}
					 $("#signupBtn").removeAttr("disabled");

        });
  }
}

var loginSetup = new LoginSetup();
