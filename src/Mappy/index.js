;
import './css/login.css';

var i=1;

$(function() {

  $("#signupBtn").click(function () {
    
    
   $.post("/demo/api/1129/3213e2cfeed268d4ff0e067aa9f5f528d85bdf577e30e3a266f22556865db23a/login",
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


  document.getElementById("usersData").classList.add("table-responsive");  
  var table = document.getElementById("usersTable");
  
  table.classList.add("table");
  table.classList.add("table-striped");
  
  table.style.width = "100%";
  //table.classList.add("table-dark");

  //table.setAttribute("border","1");
  //table.setAttribute("cellpadding","30");
  //table.setAttribute("cellspacing","5");

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
    table.appendChild(row1);
  }
  count = i;

  var span = document.createElement('span');
  var buttonDiv = document.getElementById("buttonDiv");
 
buttonDiv.innerHTML = '<button id="nextBtn" value="Next"  class ="nextBtn" >Next</button>';
//buttonDiv.onclick = requestNextData(pageNo);
document.getElementById("nextBtn").addEventListener("click", function(e) {
	requestNextData(pageNo)
});
}
function requestNextData(pageNo){
  pageNo+=1;
  console.log(pageNo);
  $.ajax({
    type: 'GET',
    url: '/demo/api/1129/3213e2cfeed268d4ff0e067aa9f5f528d85bdf577e30e3a266f22556865db23a/users?page='+pageNo,
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


