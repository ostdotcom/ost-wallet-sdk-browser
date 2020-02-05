
import '../css/login.css';
import OstSetup from "./common";

//var baseUrl="https://demo-devmappy.stagingostproxy.com/demo/api/1129/3213e2cfeed268d4ff0e067aa9f5f528d85bdf577e30e3a266f22556865db23a";

var i=1;

var ostSetup = new OstSetup();
var baseUrl = ostSetup.getBaseUrl();

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

    //  deviceSetup();
    

    $(function() {
    
      $.ajax({
        type: 'GET',
        url: baseUrl+'/users',
        data: {
        },
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (jsonData) {

          //window.location.href = "/devserver/users.html";
          console.log(jsonData.data.users[0].token_id);
          
          var pageNo=1;
          
          uploadUserData(jsonData,pageNo);
        },
        error: function (error) {
          console.log('Error loading username=');
        }
      });
    });

      function uploadUserData(jsonData, pageNo) {
        if(!jsonData.data.meta.next_page_payload){
          return ;
        }

        console.log("user data is going to be add in this function");
        

        //document.getElementById("signUpForm").style.display = "none";
       // document.getElementById("icon").style.display = "none";
        document.createElement("label");
          // let label = document.getElementById("logOutLabel");
          // label.innerHTML = '<button id="logOutBtn" class="btn btn-info" name="btn">Log Out</button>';
          // let logOutBtn = document.getElementById("logOutBtn");
          // logOutBtn.classList.add("btn");
          // logOutBtn.classList.add("btn-default"); 
          // logOutBtn.classList.add("btn-sm");
        document.getElementById("logOutBtn").addEventListener("click", function(e) {
                logout();
            });

        document.getElementById("usersData").classList.add("table-responsive");  
        var table = document.getElementById("usersTable");
        
        table.classList.add("table");
        table.classList.add("table-striped");
        
        table.style.width = "100%";
        

        if (pageNo == 1){
          var header = table.createTHead();
          header.classList.add("thead-dark");
          var row = header.insertRow(0);
          var cell1 = row.insertCell(0).innerHTML = "Id";
          //cell1.setAttribute("scope","col");
          cell1 = row.insertCell(1).innerHTML = "Username";
          //cell1.setAttribute("scope","col");
          cell1 = row.insertCell(2).innerHTML = "Balance";
          //cell1.setAttribute("scope","col");
          cell1 = row.insertCell(3).innerHTML = "Send";
          //cell1.setAttribute("scope","col");
          cell1 = row.insertCell(4).innerHTML = "QR Code";
        }
        let count =i;
        let k=0;
        for( ; i<count+10 ; i++,k++){
          var row1 = document.createElement("tr");
          //var textNode = document.createTextNode(i);

          //var row1 = table.insertRow(i);
          var cell1 = row1.insertCell(0).innerHTML = i;
          console.log(jsonData.data.users[k].username);
          var cell2 = row1.insertCell(1).innerHTML = jsonData.data.users[k].username;
        
          var cell3 = row1.insertCell(2).innerHTML = "Balance=0";
          var cell4 = row1.insertCell(3).innerHTML = '<button id="btn" class="btn btn-info" name="btn">Send</button>';
          var cell5 = row1.insertCell(4).innerHTML = '<button id="Qrcodebtn" class="btn btn-info QrCodeBtnClass"  " data-toggle="modal" data-target="#myModal">Get QR</button> ';
          table.appendChild(row1);
        }
        count = i;

        var span = document.createElement('span');
        var buttonDiv = document.getElementById("buttonDiv");
      
        buttonDiv.innerHTML = '<button id="nextBtn" value="Next"  class ="nextButton arrow" >Next</button>';
        //buttonDiv.onclick = requestNextData(pageNo);
        document.getElementById("nextBtn").addEventListener("click", function(e) {
            requestNextData(pageNo);
        });

        $(".QrCodeBtnClass").on('click', function(event){
            let text = '{"token_id":1129,"token_name":"STC1","token_symbol":"SC1","url_id":"3213e2cfeed268d4ff0e067aa9f5f528d85bdf577e30e3a266f22556865db23a","mappy_api_endpoint":"https://demo-mappy.stagingost.com/demo/","saas_api_endpoint":"https://api.stagingost.com/testnet/v2/","view_api_endpoint":"https://ost:A$F^\u0026n!@$ghf%7@view.stagingost.com/testnet//testnet/"}';
            let obj =JSON.parse(text);
            makeCode(text);
        });
                // document.getElementsByClassName("QrCode").addEventListener("click", function(e) {
            //   let text = '{"token_id":1129,"token_name":"STC1","token_symbol":"SC1","url_id":"3213e2cfeed268d4ff0e067aa9f5f528d85bdf577e30e3a266f22556865db23a","mappy_api_endpoint":"https://demo-mappy.stagingost.com/demo/","saas_api_endpoint":"https://api.stagingost.com/testnet/v2/","view_api_endpoint":"https://ost:A$F^\u0026n!@$ghf%7@view.stagingost.com/testnet//testnet/"}';
            //   let obj =JSON.parse(text);
            //   makeCode(text);
                
            // });
}





function requestNextData(pageNo){
        pageNo+=1;
        console.log(pageNo);
        $.ajax({
            type: 'GET',
            url: baseUrl+'/users?page='+pageNo,
            data: {
            username: document.getElementById("usernameTb").value,
            password: document.getElementById("password").value
        },
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (jsonData) {

            // alert(jsonData.data.users[0].username);
            console.log(jsonData.data.users[0].token_id);
            //window.location.replace("/html/users.html");
            //document.getElementById("usersData").innerHTML='<object type="text/html" data="http://localhost:9000/src/html/Users.html" ></object>';
            //userData(jsonData);
            $("#table_of_items tr").remove(); 
            uploadUserData(jsonData,pageNo);
        },
        error: function (error) {
            alert('Error loading username=' + document.getElementById("usernameTb").value + error);
        }
        });


}
function logout(){
    $.post(baseUrl+"/users/logout",
    {


    },
    function (data, status) {

    window.location="/login";


    });
}
function makeCode(object){
  
    let text  =  JSON.stringify(object);
    $("#QrMainDiv div").html('');  
    var qrcode = new QRCode(document.getElementById("qrcode"), {
      text: text,
      width: 470,
      height: 470,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
  });
}
});
