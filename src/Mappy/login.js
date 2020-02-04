
import './css/login.css';

var baseUrl="https://demo-devmappy.stagingostproxy.com/demo/api/1129/3213e2cfeed268d4ff0e067aa9f5f528d85bdf577e30e3a266f22556865db23a";

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
           
           //var data =registerDevice("0x69F3a70eD7Ab01826a1b4F0b262b3886D4D0685a","0x1ffc91Bce15fAd500f1Bb3f265cE33d4D385ff51","Postman client 2","0x69F3a70eD7Ab01826a1b4F0b262b3886D4D0685a");
           //alert(data);
           document.getElementById("signupBtn").disabled = true;
         $.ajax({
           type: 'GET',
           url: baseUrl+'/users',
           data: {
           },
           contentType: 'application/json; charset=utf-8',
           dataType: 'json',
           success: function (jsonData) {
 
             window.location.href = "/devserver/users.html";
             //console.log(jsonData.data.users[0].token_id);
             
             //var pageNo=1;
             
             //uploadUserData(jsonData,pageNo);
           },
           error: function (error) {
             console.log('Error loading username=' + document.getElementById("usernameTb").value + error);
           }
         });
       }
       });
   });