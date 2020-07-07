// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.database();
var username;
var password = "";

document.getElementById("submit").addEventListener("click", function() {
  username = document.getElementById("user").value;
  localStorage.setItem("username", username);
  password = document.getElementById("password").value;
  db.ref('users/' + username).update({
    password: password
  });
  document.getElementById("signin").style.display = 'none';
  document.getElementById("todoContainer").style.display = 'block';
  document.getElementById("timeContainer").style.display = 'block';
  document.getElementById("scriptBox").disabled = false;
  location.reload();
});

function initApp() {
  // Listen for auth state changes.
  firebase.auth().onAuthStateChanged(function(user) {
    console.log('User state change detected from the Background script of the Chrome Extension:', user);
  });
  if (localStorage.getItem("username") != null) {
    document.getElementById("signin").style.display = 'none';
    document.getElementById("scriptBox").disabled = false;
  }
  else {
    document.getElementById("scriptBox").disabled = true;
    document.getElementById("todoContainer").style.display = 'none';
    document.getElementById("timeContainer").style.display = 'none';
    document.getElementById("signin").style.display = 'block';
  }
}

var images = ["cliffsofmoher.jpg", "cliffsofmoher2.jpg", "edinburgh.jpg", "isleofskyelake.jpg", "italy.jpg", "london.jpg", "rome.jpg"];
var m_names = ["January", "February", "March", 
"April", "May", "June", "July", "August", "September", 
"October", "November", "December"];
var d_names = ["Sunday","Monday", "Tuesday", "Wednesday", 
"Thursday", "Friday", "Saturday"];
var d_names_letters = ["S" ,"M", "T", "W", "T", "F", "S"];
var lat, long;

function initGeolocation() {
  if( navigator.geolocation )
  {
      // Call getCurrentPosition with success and failure callbacks
      navigator.geolocation.getCurrentPosition( success, fail );
  }
  else
  {
      alert("Sorry, your browser does not support geolocation services.");
  }
}

function success(position) {
    long = position.coords.longitude;
    lat = position.coords.latitude;
    fetch('https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + long + '&appid=' + openWeatherAPI + '&units=imperial') 
    .then(function(resp) { return resp.json() }) // Convert data to json
    .then(function(data) {
      document.getElementById('displayWeather').innerHTML = 'Feels like: ' + data.main.feels_like + String.fromCharCode(176);
    })
    .catch(function() {
      // errors
    });
    fetch('https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + long + '&appid=' + openWeatherAPI + '&units=imperial') 
    .then(function(resp) { return resp.json() }) // Convert data to json
    .then(function(data) {
      document.getElementById('displayForecastDays').innerHTML += '&ensp;';
      for (var i = 0; i < 5; i++) {
        let date = data.list[i*8].dt_txt;
        date = date.split(" ")[0];
        let parts = date.split('-');
        let year = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10) - 1;
        let day = parseInt(parts[2], 10);
        date = new Date(year, month, day);
        document.getElementById('displayForecastDays').innerHTML = document.getElementById('displayForecastDays').innerHTML + d_names_letters[date.getDay()] + '&emsp; ';
        document.getElementById('displayForecastWeather').innerHTML = ~~data.list[i*8].main.feels_like + String.fromCharCode(176) + ' ' + document.getElementById('displayForecastWeather').innerHTML;
      }
    })
    .catch(function() {
      console.log('error');
    });
}

function fail() {
  console.log("couldn't obtain location");
}
setInterval(initGeolocation, 1000 * 60 * 60 * 24);

window.onload = function() {
  initApp();
  change_image();
  startTime();
  startDay();
  initGeolocation();
};

function change_image() {
    var newUrl = images[Math.floor(Math.random() * images.length)];
    console.log(newUrl);
    document.body.style.backgroundImage = 'url(images/' + newUrl + ')';
}
setInterval(change_image, 1000 * 60 * 60 * 24);

function startTime() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  m = checkTime(m);
  document.getElementById('displayTime').innerHTML = h + ":" + m;
  var t = setTimeout(startTime, 500);
}

function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}

function startDay() {
  var myDate = new Date();
  myDate.setDate(myDate.getDate());
  var curr_date = myDate.getDate();
  var curr_month = myDate.getMonth();
  var curr_day  = myDate.getDay();
  document.getElementById('displayDay').innerHTML = d_names[curr_day] + " " + m_names[curr_month] + ", " + curr_date;
  var t = setTimeout(startDay, 1000*60*60*24);
}

document.getElementById("scriptBox").addEventListener("keydown", function(e) {
  if (e.keyCode == 13) {
    var todo = document.getElementById("scriptBox").value;
    var key = db.ref().child('users/' + localStorage.getItem("username") + '/todo/').push().key;
    var updates = {};
    updates['users/' + localStorage.getItem("username") + '/todo/' + key] = {
      done: false,
      itemText: todo,
      objectId: key
    };
    db.ref().update(updates);
    document.getElementById("scriptBox").value = '';
  }
}, false);

  // CHECKS FOR UPDATES IN LIST
console.log('USERNAME: ', localStorage.getItem("username"));
var todos = db.ref('users/' + localStorage.getItem("username") + '/todo/');
todos.on('child_added', function(data) {
  /**
   * DATA CALLS
   * data.key
   * data.val()
   * data.val().author
   */
  if (data.val().done == true) {
    document.getElementById("todo").outerHTML =
    "<li><label for="+ data.key +"><input type='checkbox' checked id=" + data.key + ">" +
    data.val().itemText + "</label>" + 
    "<button id=" +  data.key + ">x</button></li>" + document.getElementById("todo").outerHTML ;
  }
  else {
    document.getElementById("todo").outerHTML =
    "<li><label for="+ data.key +"><input type='checkbox' id=" + data.key + ">" +
    data.val().itemText + "</label>" + 
    "<button id=" +  data.key + ">x</button></li>" + document.getElementById("todo").outerHTML ;
  }
  
  initializeCheckbox();
  initializeDelete();
});

todos.on('child_changed', function(data) {
  console.log('child changed ', data.val().itemText);
  if (data.val().done == true) {
    document.getElementById(data.key).checked = true;
  }
  else {
    document.getElementById(data.key).checked = false;
  }
});

todos.on('child_removed', function(data) {
  console.log('child removed ', data.val().itemText);
  document.getElementById(data.key).parentElement.remove();
  document.getElementById(data.key).remove();
});

function initializeCheckbox() {
  var allCheckboxes = document.querySelectorAll("input[type='checkbox']");
  [].forEach.call(allCheckboxes, function (cb) {
    cb.addEventListener("change", function(){
        if (this.checked) {
          db.ref('users/' + localStorage.getItem("username") + '/todo/' + this.id).update({done: true});
        }
        else {
          db.ref('users/' + localStorage.getItem("username") + '/todo/' + this.id).update({done: false});
        }
    });
  });
}

function initializeDelete() {
  var allDeletes = document.querySelectorAll("button");
  [].forEach.call(allDeletes, function (del) {
    del.addEventListener("click", function(){
      db.ref('users/' + localStorage.getItem("username") + '/todo/' + this.id).remove();
      // this.parentElement.remove();
      this.remove();
          // location.reload();
    });
  });
}