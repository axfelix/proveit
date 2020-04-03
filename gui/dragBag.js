const notifier = require("node-notifier");
const tt = require('electron-tooltip');
const path = require('path');
const fs = require('fs');
const {dialog} = require('electron').remote;
const {app} = require('electron').remote;
const remote = require('electron').remote;
let client = remote.getGlobal('client');
let packageFolder = null;
tt({position: 'right'})

var configpath = path.join(app.getPath("userData"), "moveituser.json");
if (fs.existsSync(configpath)) {
  let config_json = JSON.parse(fs.readFileSync(configpath));
  for (setting in config_json){
    document.getElementById(setting).value = config_json[setting];
  }
}

var $TABLE = $('#table');
var $BTN = $('#export-btn');
var $EXPORT = $('#export');

$('.table-add').click(function () {
  var $clone = $TABLE.find('tr.hide').clone(true).removeClass('hide table-line');
  $TABLE.find('table').append($clone);
});

$('.table-remove').click(function () {
  $(this).parents('tr').detach();
});

$('.table-up').click(function () {
  var $row = $(this).parents('tr');
  if ($row.index() === 1) return; // Don't go above the header
  $row.prev().before($row.get(0));
});

$('.table-down').click(function () {
  var $row = $(this).parents('tr');
  $row.next().after($row.get(0));
});

// A few jQuery helpers for exporting only
jQuery.fn.pop = [].pop;
jQuery.fn.shift = [].shift;

$BTN.click(function () {
  var $rows = $TABLE.find('tr:not(:hidden)');
  var headers = [];
  var data = [];
  
  // Get the headers (add special header logic here)
  $($rows.shift()).find('th:not(:empty)').each(function () {
    headers.push($(this).text().toLowerCase());
  });
  
  // Turn all existing rows into a loopable array
  $rows.each(function () {
    var $td = $(this).find('td');
    var h = {};
    
    // Use the headers from earlier to name our hash keys
    headers.forEach(function (header, i) {
      h[header] = $td.eq(i).text();   
    });
    
    data.push(h);
  });
  
  // Output the result
  $EXPORT.text(JSON.stringify(data));
});

function package() {
  var contactname = document.getElementById("contactname").value;
  var jobtitle = document.getElementById("jobtitle").value;
  var department = document.getElementById("department").value;
  var email = document.getElementById("email").value;
  var phone = document.getElementById("phone").value;
  var creator = document.getElementById("creator").value;
  var rrsda = document.getElementById("rrsda").value;
  var title = document.getElementById("title").value;
  var datefrom = document.getElementById("datefrom").value;
  var dateto = document.getElementById("dateto").value;
  var description = document.getElementById("description").value;
  var metadata = document.getElementById("metadata").value;
  if (contactname === "" || email === "" || title === ""){
    notifier.notify({"title" : "MoveIt", "message" : "Contact name, email, and transfer title are required fields."});
  } else {
    packageFolder = dialog.showOpenDialog({properties: ["openDirectory"]});
    if (packageFolder){
      notifier.notify({"title" : "MoveIt", "message" : "Creating transfer package..."});
      client.invoke("bag_package", contactname, jobtitle, department, email, phone, creator, rrsda, title, datefrom, dateto, description, metadata, JSON.stringify(packageFolder[0]), function(error, res, more) {
        if (res === true){
          notifier.notify({"title" : "MoveIt", "message" : "Transfer package has been created on desktop."});
          var configblock = {"contactname": contactname, "jobtitle": jobtitle, "department": department, "email": email, "phone": phone};
          fs.writeFile(configpath, JSON.stringify(configblock), (err) => {
            if (err) throw err;
          });
        } else {
          notifier.notify({"title" : "MoveIt", "message" : "Error creating transfer package."});
        }
      });
    }
  }
}

document.getElementById("package").addEventListener("click", package);