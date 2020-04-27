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


dropzone.options.bagDropzone = {
  //init: function() { this.on("addedfile", bagLoad(file)); },
  dictDefaultMessage: "Drag a Bag from your computer here, or click to browse for one.",
  dictInvalidFileType: "Provide Bags in zip or 7z format.",
  maxFiles: 1,
  acceptedFiles: "application/zip,.7z",
  //method: function bagLoad(files) { return files; }
};

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
  //client.invoke("bag_load", JSON.stringify(packageFolder[0]), function(error, res, more) {
  notifier.notify({"title" : "DragBag", "message" : "That's a bag!"});
  //});
  document.getElementById("plus").style.display = 'inline';
  document.getElementById("package").style.display = 'inline';
}

document.getElementById("package").addEventListener("click", package);