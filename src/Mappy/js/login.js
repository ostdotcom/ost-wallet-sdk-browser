
import '../css/login.css';

var baseUrl="https://demo-devmappy.stagingostproxy.com/demo/api/1129/3213e2cfeed268d4ff0e067aa9f5f528d85bdf577e30e3a266f22556865db23a";

$(function() {
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

      getCurrentUser(function () {
          //Navigate to /users page.
          window.location = "/users";
      });

});

function getCurrentUser( successCallback, failuerCallback ) {
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

$("#signupBtn").click(function () {
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
                window.location = "/users";
            } else {
                $("#signupBtn").removeAttr("disabled");
                // TODO: Display error on page.
                console.log("Issues logging in", error);
            }
       });
   });