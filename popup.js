// let changeColor = document.getElementById('changeColor');

//   chrome.storage.sync.get('color', function(data) {
//     changeColor.style.backgroundColor = data.color;
//     changeColor.setAttribute('value', data.color);
//   });

//   changeColor.onclick = function(element) {
//     let color = element.target.value;
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//       chrome.tabs.executeScript(
//           tabs[0].id,
//           {code: 'document.body.style.backgroundColor = "' + color + '";'});
//     });
//   };

// https://github.com/firebase/quickstart-js/tree/master/auth/chromextension
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
  document.getElementById("signinContainer").style.display = 'none';
  location.reload();
});

/**
 * initApp handles setting up the Firebase context and registering
 * callbacks for the auth status.
 *
 * The core initialization is in firebase.App - this is the glue class
 * which stores configuration. We provide an app name here to allow
 * distinguishing multiple app instances.
 *
 * This method also registers a listener with firebase.auth().onAuthStateChanged.
 * This listener is called when the user is signed in or out, and that
 * is where we update the UI.
 *
 * When signed in, we also authenticate to the Firebase Realtime Database.
 */
function initApp() {
  // Listen for auth state changes.
  firebase.auth().onAuthStateChanged(function(user) {
    console.log('User state change detected from the Background script of the Chrome Extension:', user);
  });
  if (localStorage.getItem("username") != null) {
    document.getElementById("signinContainer").style.display = 'none';
    document.getElementById("scriptBox").disabled = false;
  }
  else {
    document.getElementById("scriptBox").disabled = true;
    document.getElementById("signinContainer").style.display = 'block';
  }
  // if (localStorage.getItem("username") == null) {
  //   username = prompt('Input username');
  //   localStorage.setItem("username", username);
  //   password = prompt('Input password');
  //   db.ref('users/' + username).set({
  //     password: password
  //   });
  // }
  // db.ref('users/nikkih').set({
  //   password: "test"
  // });
}

window.onload = function() {
  initApp();
  // getAllTodos();
  // displayTodos();
};

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

// function getAllTodos() {
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
    // document.getElementById("todo").outerHTML += "<p5 id=" + data.key + ">" + data.val() + "</p5><br>";
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

  // READ DATA ONCE CODE
  // db.ref("users/001/todo").once('value').then(function(snapshot){
  //   snapshot.forEach(function(childSnapshot) {
  //     // window.allTodos.push({
  //     //   done: childSnapshot.val().done,
  //     //   itemText: childSnapshot.val().itemText,
  //     //   objectId: childSnapshot.key
  //     // });
  //     document.getElementById("todo").outerHTML =
  //     "<li><label for="+ childSnapshot.key +"><input type='checkbox' id=" + childSnapshot.key + ">" +
  //     childSnapshot.val().itemText + "</label>" + 
  //     "<button id=" +  childSnapshot.key + ">x</button></li>" + document.getElementById("todo").outerHTML ;
  //   });
  //   // for (i = allTodos.length - 1; i >= 0; i--) {
  //     // document.getElementById("todo").outerHTML +=
  //     // "<li><label for="+ allTodos[i].objectId +"><input type='checkbox' id=" + allTodos[i].objectId + ">" +
  //     // allTodos[i].itemText + "</label>" + 
  //     // "<button id=" +  allTodos[i].objectId + ">x</button></li>";
  //   // }
  //   checkbox();
  // });
  
// }

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
      this.parentElement.remove();
          // location.reload();
    });
  });
}