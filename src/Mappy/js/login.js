import '../css/login.css';
import PageInitializer from "./PageInitializer";
import ajaxUtils from "./ajaxUtils";

export class LoginSetup {
  constructor() {
    const oThis = this;

    oThis.postLoginUrl = "./sdk-getters.html";

    // Create an instance of PageInitializer
    let autoPerform = false;
    oThis.pageInitializer = new PageInitializer( autoPerform );

    // Wait for document to be ready.
    $(() => {
      oThis.init();
    });

    oThis.bindEvents();
  }

  init(){
    const oThis = this;

    const dontLogout = true;
    oThis.pageInitializer.getCurrentUserFromServer( dontLogout )
      .then(( currentUser ) => {
        // Already logged in.
        // Navigate to sdk-getter page.
        window.location = oThis.postLoginUrl;
      })
      .catch(( err ) => {
        $("#signupBtn").css({
          "display": "none",
          "visibility": "visible"
        }).fadeIn();
      })
  }

  bindEvents() {
    const oThis = this;
    $(function () {
      $("#signupBtn").click(function () {
        oThis.onClickLogin();
     });
    })
  }

  onClickLogin() {
    const oThis = this;
    const apiUrl = oThis.pageInitializer.getApiBaseUrl() + '/login';

    $("#signupBtn").attr("disabled", true);
    return ajaxUtils.post( apiUrl, {
        username: document.getElementById("usernameTb").value,
        password: document.getElementById("password").value
      })
      .then( ( data ) =>{
        // User has loged in.
        window.location = oThis.postLoginUrl;
      })
      .catch( (error) => {
        $("#login-error-message").css({
          "display": "none",
          "visibility": "visible"
        }).fadeIn().fadeOut(3000, function () {
          $(this).css({
            "display": "block",
            "visibility": "hidden"
          })
        });
        $("#signupBtn").attr("disabled", false);
      })

  }
}

var loginSetup = new LoginSetup();
