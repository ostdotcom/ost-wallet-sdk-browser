;
import './css/login.css';

var i=1;
var baseUrl="/demo/api/1129/3213e2cfeed268d4ff0e067aa9f5f528d85bdf577e30e3a266f22556865db23a";





$(function() {

  $("#signupBtn").click(function () {
    
    
   $.post(baseUrl+"/login",
      {
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
        if(data.success==true){
          
          registerDevice("0x69F3a70eD7Ab01826a1b4F0b262b3886D4D0685a","0x1ffc91Bce15fAd500f1Bb3f265cE33d4D385ff51","Postman client 2","0x69F3a70eD7Ab01826a1b4F0b262b3886D4D0685a");
          document.getElementById("signupBtn").disabled = true;
        $.ajax({
          type: 'GET',
          url: baseUrl+'/users',
          data: {
          },
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          success: function (jsonData) {

           
            console.log(jsonData.data.users[0].token_id);
            
            var pageNo=1;
            
            uploadUserData(jsonData,pageNo);
          },
          error: function (error) {
            console.log('Error loading username=' + document.getElementById("usernameTb").value + error);
          }
        });
      }
      });
  });
})








function uploadUserData(jsonData, pageNo) {
            if(!jsonData.data.meta.next_page_payload){
              return ;
            }

            console.log("user data is going to be add in this function");
            

            document.getElementById("signUpForm").style.display = "none";
            document.getElementById("icon").style.display = "none";
            document.createElement("label");
            let label = document.getElementById("logOutLabel");
            label.innerHTML = '<button id="logOutBtn" class="btn btn-info" name="btn">Log Out</button>';
            let logOutBtn = document.getElementById("logOutBtn");
            logOutBtn.classList.add("btn");
            logOutBtn.classList.add("btn-default"); 
            logOutBtn.classList.add("btn-sm");
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
              var cell5 = row1.insertCell(4).innerHTML = '<button id="Qrcodebtn" class="btn btn-info  " data-toggle="modal" data-target="#myModal">Get QR</button> ';
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

          document.getElementById("Qrcodebtn").addEventListener("click", function(e) {
            generateQRCode();
            
          });
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
  $.post(baseUrl+"/logout",
  {
    

  },
  function (data, status) {
    
    console.log("regData: " + data + "\nStatus: " + status);
    // Make another api call to fetch current user info.
    console.log("reg",data.success);
   
    
  });
}


function registerDevice(address, api_signer_address, device_name , device_uuid){

  $.post(baseUrl+"/devices",
  {
    address:address,
    api_signer_address: api_signer_address,
    device_name: device_name,
    device_uuid: device_uuid

  },
  function (data, status) {
    
    console.log("regData: " + data + "\nStatus: " + status);
    // Make another api call to fetch current user info.
    console.log("reg",data.success);
    console.log("reg",data.code)
    if(data.success==false){
      alert("Already exists or invalid entry");
    }
    else{
      return data;
    }
  });

}



function generateQRCode(){

    
}






