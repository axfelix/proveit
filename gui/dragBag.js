const notifier = require("node-notifier");
const tt = require('electron-tooltip');
const path = require('path');
const fs = require('fs');
const dropzone = require('dropzone');
const {dialog} = require('electron').remote;
const {app} = require('electron').remote;
const remote = require('electron').remote;
let client = remote.getGlobal('client');
let packageFolder = null;
tt({position: 'right'})

let bagpath = null;

dropzone.options.bagDropzone = {
  dictDefaultMessage: "Drag a Bag from your computer here, or click to browse for one.",
  dictInvalidFileType: "Provide Bags in zip or 7z format.",
  maxFiles: 1,
  acceptedFiles: ".zip,.7z",
  addedfile: function(file) {
    bagLoad(file);
    let allFinished = true;
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

function bagLoad(bag) {
  document.getElementById("plus").style.display = 'inline';
  document.getElementById("package").style.display = 'inline';
  bagpath = bag.path;
  client.invoke("bag_load", bag.path, function(error, res, more) {
    if (res[0]){
      notifier.notify({"title" : "DragBag", "message" : "Bag and all checksums are valid."});
      var element = document.getElementById('properties');
      element.innerHTML = '<tr class="hide"><td contenteditable="true">Untitled</td><td contenteditable="true">undefined</td><td><span class="table-remove glyphicon glyphicon-remove"></span></td></tr>';
      var bagDropzone = document.getElementById("bagDropzone");
      var existingBagname = document.getElementById("existingBagname");
      if (existingBagname) {
        bagDropzone.removeChild(existingBagname);
      }
      var bagname = document.createElement('p');
      var currentBagname = document.createTextNode(bag.name);
      bagname.appendChild(currentBagname);
      bagname.setAttribute("class", "dz-message");
      bagname.setAttribute("id", "existingBagname");
      bagDropzone.appendChild(bagname);
      for (let x in res[1]) {
        // There's probably a nicer way of templating this
        var row = document.createElement('tr');
        var key = document.createElement('td');
        key.setAttribute("contenteditable", "true");
        var keyvalue = document.createTextNode(x);
        row.appendChild(key);
        key.appendChild(keyvalue);
        var value = document.createElement('td');
        value.setAttribute("contenteditable", "true");
        // This feels way too Pythonic, and bad here
        var valuevalue = document.createTextNode(res[1][x]);
        row.appendChild(value);
        value.appendChild(valuevalue);
        var remove = document.createElement('td');
        var removespan = document.createElement('span');
        removespan.setAttribute("class", "table-remove glyphicon glyphicon-remove");
        row.appendChild(remove);
        remove.appendChild(removespan);
        element.appendChild(row);
      $('.table-remove').click(function () {
        $(this).parents('tr').detach();
      });
      }
    } else {
      notifier.notify({"title" : "DragBag", "message" : "Not a valid bag."});
      if (res[1]){
        // Do something with the list of invalid files
        console.log(res[1]);
      } else {
        bagDropzone.dropzone.removeAllFiles();
      }
    }
  });
}

function package() {
  var rows = [];
  $('tbody').eq(0).find('tr').each((r,row) => rows.push($(row).find('td').map((c,cell) => $(cell).text()).toArray()))
  client.invoke("bag_update", rows, bagpath, function(error, res, more) {
    if (res === true){
      notifier.notify({"title" : "MoveIt", "message" : "The bag has been updated on your desktop."});
    } else {
      notifier.notify({"title" : "MoveIt", "message" : "Error updating bag."});
    }
  });
}

document.getElementById("package").addEventListener("click", package);
