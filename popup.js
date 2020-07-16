var images = ["cliffsofmoher.jpg", "cliffsofmoher2.jpg", "edinburgh.jpg", "isleofskyelake.jpg", "italy.jpg", "london.jpg", "rome.jpg", "cliffs3.jpg", "cliffs4.jpg", "deans.jpg", "ios.jpg", "ios2.jpg", "ios3.jpg", "ios4.jpg", "nz.jpg", "stpauls.jpg", "trevvi.jpg"];
var m_names = ["January", "February", "March", 
"April", "May", "June", "July", "August", "September", 
"October", "November", "December"];
var d_names = ["Sunday","Monday", "Tuesday", "Wednesday", 
"Thursday", "Friday", "Saturday"];
var d_names_letters = ["S" ,"M", "T", "W", "T", "F", "S"];
var lat, long;

window.onload = function() {
  initApp();
  change_image();
  startTime();
  startDay();
  initGeolocation();
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.database();
var username;
var password = "";

document.getElementById("loginButton").addEventListener("click", function() {
  document.getElementById("signupContainer").style.display = 'none';
  document.getElementById("loginContainer").style.display = 'block';
  document.getElementById("loginButton").style.backgroundColor = 'rgba(144,238,144, 0.9)';
  document.getElementById("signupButton").style.backgroundColor = 'rgb(255,255,255)';
});

document.getElementById("signupButton").addEventListener("click", function() {
  document.getElementById("loginContainer").style.display = 'none';
  document.getElementById("signupContainer").style.display = 'block';
  document.getElementById("submitSignup").style.display = 'none';
  document.getElementById("signupButton").style.backgroundColor = 'rgba(144,238,144, 0.9)';
  document.getElementById("loginButton").style.backgroundColor = 'rgb(255,255,255)';
});

document.getElementById("submitLogin").addEventListener("click", function() {
  var user = document.getElementById("userLogin").value;
  var pswd = document.getElementById("passwordLogin").value;
  var userExists = false;
  var correctPswd = false;
  if (user == '' || pswd == '') {
    document.getElementById("verifyLogin").innerHTML = "Fields are empty.";
  } else {
    db.ref('users').once("value").then((snapshot) => {
      snapshot.forEach((data) =>{
          if (user === data.key && pswd === data.val().password) {
            userExists = true;
            correctPswd = true;
          }
          else if (user === data.key && pswd != data.val().password) {
            correctPswd = false;
            userExists = true;
          }
      });

      if (userExists == true && correctPswd == true) {
        console.log('user exists');
        localStorage.setItem("username", user);
        db.ref('users/' + user).update({
          password: pswd
        });
        document.getElementById("account").style.display = 'none';
        document.getElementById("todoContainer").style.display = 'block';
        document.getElementById("timeContainer").style.display = 'block';
        document.getElementById("scriptBox").disabled = false;
        location.reload();
      }
      else if (correctPswd == false && userExists == true) {
        document.getElementById("verifyLogin").innerHTML = "Incorrect password.";
      } else {
        document.getElementById("verifyLogin").innerHTML = "Username does not exist.";
      }
    }).catch((e) =>{
      console.log(e);
    });
  }
});

document.getElementById("passwordVerify").onkeyup = function() {
  var pswd = document.getElementById("passwordSignup").value;
  var pswdVerify = document.getElementById("passwordVerify").value;
  var user = document.getElementById("userSignup").value;

  if (pswd != pswdVerify) {
    document.getElementById("verifyPasswords").innerHTML = "Passwords do not match."
    document.getElementById("submitSignup").style.display = 'none';
  }
  else if (pswdVerify == '') {
    document.getElementById("verifyPasswords").innerHTML = "Password is empty."
    document.getElementById("submitSignup").style.display = 'none';
  } else {
    document.getElementById("verifyPasswords").innerHTML = "Passwords match!"
    document.getElementById("submitSignup").style.display = 'inline';
  }
};

document.getElementById("userSignup").onkeyup = function() {
  var user = document.getElementById("userSignup").value;
  var pswdVerify = document.getElementById("passwordVerify").value;

  if (user != '') {
    document.getElementById("verifyUsername").innerHTML = "";
  } else {
    document.getElementById("verifyUsername").innerHTML = "Username is empty."
  }
};

document.getElementById("submitSignup").addEventListener("click", function() {
  var pswd = document.getElementById("passwordSignup").value;
  var user = document.getElementById("userSignup").value;
  var userExists = false;  
  if (user == '') {
    document.getElementById("verifyUsername").innerHTML = "Username is empty.";
  }
  else {
    db.ref('users').once("value").then((snapshot) => {
      snapshot.forEach((data) =>{
          if (user === data.key) {
            document.getElementById("verifyUsername").innerHTML = "Username already exists.";
            userExists = true;
          }
      });
      if (userExists === true) {
        console.log('user exists');
      }
      else {
        console.log('user does not exist');
        localStorage.setItem("username", user);
        db.ref('users/' + user).update({
          password: pswd
        });
        document.getElementById("account").style.display = 'none';
        document.getElementById("todoContainer").style.display = 'block';
        document.getElementById("timeContainer").style.display = 'block';
        document.getElementById("scriptBox").disabled = false;
        location.reload();
      }
    }).catch((e) =>{
      console.log(e);
    });
  }
});

function initApp() {
  // Listen for auth state changes.
  firebase.auth().onAuthStateChanged(function(user) {
    console.log('User state change detected from the Background script of the Chrome Extension:', user);
  });
  if (localStorage.getItem("username") != null) {
    document.getElementById("account").style.display = 'none';
    document.getElementById("scriptBox").disabled = false;
  }
  else {
    document.getElementById("scriptBox").disabled = true;
    document.getElementById("todoContainer").style.display = 'none';
    document.getElementById("timeContainer").style.display = 'none';
    document.getElementById("account").style.display = 'block';
    document.getElementById("signupButton").style.backgroundColor = 'rgba(144,238,144, 0.9)';
    document.getElementById("submitSignup").style.display = 'none';
  }
}

function initGeolocation() {
  var geoOptions = {
    maximumAge: 5 * 60 * 1000,
    timeout: 10 * 1000
  }
  navigator.geolocation.getCurrentPosition(success, fail , geoOptions);
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
// setInterval(initGeolocation, 1000 * 60 * 60 * 24);

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