// ==UserScript==
// @name        Dynatrace Heatmap
// @namespace   Dynatrace
// @version     1
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js
// @require     https://github.com/pa7/heatmap.js/raw/master/build/heatmap.js
// @resource    hmDialog https://raw.githubusercontent.com/Dynatrace/Dynatrace-UEM-PureLytics-Heatmap/master/heatmap-dialog.html
// @connect     *
// @grant       GM_xmlhttpRequest
// @grant       GM_getResourceText
// ==/UserScript==

// change the defaults here:
var hmUrl = "XXX";
var hmUser = "XXX";
var hmPass = "XXX";
var hmTimeframe = 14;
var bucketSize = 1; //optimization for creating points in groups instead of 1 at a time
var debugLog = 0; // Set to 1 to enable console logs, 0 to diable logging
var allClicks = "_type:useraction AND data.source.url: \\\"" + window.location + "\\\"";

function createJSONQuery(query, durationms) {
  return '{\
  "query": {\
    "filtered": {\
      "query": {\
        "query_string": {\
          "query": "' + query + '",\
          "analyze_wildcard": true\
        }\
      },\
      "filter": {\
        "bool": {\
          "must": [\
            {\
              "range": {\
                "data.startTime": {\
                  "gte": ' + (new Date().getTime() - durationms) + ',\
                  "lte": ' + new Date().getTime() + '\
                }\
              }\
            }\
          ],\
          "must_not": []\
        }\
      }\
    }\
  },\
  "size": 0,\
  "aggs": {\
    "NAME": {\
      "terms": {\
        "field": "data.prettyName",\
        "size": 200\
      }\
    }\
  }\
}';
}

function dt_log(msg) {
  if (debugLog) console.log(msg);
}

function drawHeatmap(links, showHidden) {
    // minimal heatmap instance configuration
    var heatmapInstance = h337.create({
      // only container is required, the rest will be defaults
      container: document.querySelector('#heatmap-container')
    });

    // now generate some random data
    var points = [];
    var max = 0;

    for (i in links) {
      var currentLink = i.split("'").join("\\'"); // escape "'" otherwise the selector wont work
      var elems = [];
      dt_log("Current Link: " + currentLink);
      try {
        elems = $("a:contains('" + currentLink + "'), input[value='" + currentLink + "']");
      } catch (e) {
        console.log(e);
      }
      dt_log("-- After contains");
      if (elems.length == 0) {
        $("#heatmap-statistics").append("Could not find " + i + " (" + links[i] + ")<br>");
        //continue; 
      }
      dt_log("-- Update Stats");
      elems.each(function (index, elem) {
        dt_log("Elem offset top: " + $(elem).offset().top + " left: " + $(elem).offset().left);
        
    
        var visible = $(elem).is(":visible"); 
        dt_log("-- Checking visibility: " + elem);
        var offsetVisible = ($(elem).offsetParent().width() > $(elem).offset().left && $(elem).offsetParent().height() > $(elem).offset().top);
        dt_log("-- Checking offset visibility");
        if (showHidden || (visible && offsetVisible)) {
  
            dt_log("-- In if statement: " + links[i]);
            var val = links[i] + 800; // add an offset to make all links visible
            max = Math.max(max, val);  
          for (j = 0; j < links[i]; j=j+bucketSize) {  
            var point = {
              x: $(elem).offset().left + Math.floor(Math.random() *  $(elem).width()),
              y: $(elem).offset().top + Math.floor(Math.random() *  $(elem).height()),
              value: val
            };
            for (k = 0; k<bucketSize; k++ ) {
              points.push(point);
            }
          }
        }
      });
      dt_log("finished Heatmap");
    }
    // heatmap data format
    var data = { 
      max: max, 
      data: points 
    };
    // if you have a set of datapoints always use setData instead of addData
    // for data initialization
    dt_log("-- Before setData");
    heatmapInstance.setData(data);
    $('#heatmap-container').css("position", "absolute");
    $('.heatmap-canvas').css("opacity", "0.5");
}

// case insensitive contains() function
$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});

function downloadClickData(searchUrl, user, pass, query, timeframeDays, showHidden) {
  $("#heatmap-spinner").fadeIn(200).show();
  $("#heatmap-container").empty().show();
  $("#heatmap-statistics").empty().show();  
  $("#hmDialog").hide();
  //alert ("Starting request");
  var LINK_REGEX = /click on \"(.*)\"/g;
  GM_xmlhttpRequest( {
    method: "POST",
    url: searchUrl,
    user: user,
    password: pass,
    data: createJSONQuery(query, 1000*60*60*24*timeframeDays), 
    headers: {
      "kbn-version": "4.5.1", // set kibana version - an apache proxy change can get rid of this
      "Content-Type": "text/json"
    },
    onload: function (response) {
      var data = JSON.parse(response.responseText);
      var links = {};
      var clicks = 0;
      var otherActions = 0;
      var topClick = "";
      var topClickCount = 0;
      for (i=0; i < data.aggregations.NAME.buckets.length; ++i) {
        var link = LINK_REGEX.exec(data.aggregations.NAME.buckets[i].key);
        var count = data.aggregations.NAME.buckets[i].doc_count;
        if (link) {
          clicks+=count;
          if (topClickCount < count) {
            topClickCount = count;
            topClick = link[1];
          }
          links[link[1]] = count;
        } else {
          otherActions += count;
        }
      }
      $("#heatmap-statistics").append("Downloaded top " + data.aggregations.NAME.buckets.length + " user actions<br>");
      $("#heatmap-statistics").append("=> " + clicks + " clicks<br>");
      $("#heatmap-statistics").append("=> " + otherActions + " actions (page loads, ...)<br>");
      $("#heatmap-statistics").append("Top click: " + topClick + "(" + topClickCount + ")<br>");
      dt_log("Before Drawing Heatmap: " + JSON.stringify(links));
      drawHeatmap(links, showHidden);
      $("#heatmap-spinner").hide();
      
    },
    onerror: function (response) {
      dt_log("Error: " + response);
      $("#heatmap-spinner").hide();
    },
    onabort: function (response) {
      dt_log("Aborted: " + response);
      $("#heatmap-spinner").hide();
    },
    ontimeout: function (response) {
      dt_log("Timeout: " + response);
      $("#heatmap-spinner").hide();
    }
  });
}

// DOM
$("body").append("<image id='heatmap-spinner' src='https://raw.githubusercontent.com/Dynatrace/Dynatrace-UEM-PureLytics-Heatmap/master/loader.gif' style='display:none; position:fixed; left:45%; top: 45%'; z-index:1000000000;'></image>");
$("body").append("<div id='heatmap-container' style='display:none;position:absolute;left:0;top:0;width:100%;height:100%;z-index:10000000'></div>");
$("body").append("<div id='heatmap-statistics' style='display:none;position:absolute;left:10px;bottom:10px;background-color:#00A6FA;box-shadow:3px 3px 9px 0px rgba(0,0,0,0.75);color:#FFF;font-size:12px;padding:8px;z-index:10000000'>Statistics go here...</div>");
$("body").append(GM_getResourceText("hmDialog"));

// Event handlers
$("#hmClose").on("click", function() {
  $("#hmDialog").hide();
});
$("#hmQueryShortcuts").on("change", function() {
  $("#hmQuery").val(allClicks + " " + $("#hmQueryShortcuts").val());
});
$("#hmGenerateHeatmap").on("click", function() {
  var searchUrl = $("#hmUrl").val();
  var user = $("#hmUser").val();
  var pass = $("#hmPass").val();
  var query = $("#hmQuery").val();
  var timeframeDays = parseInt($("#hmTimeframe").val());
  var showHidden = !$("#hmVisible").is(':checked');
  downloadClickData(searchUrl, user, pass, query, timeframeDays, showHidden);
});
$("#heatmap-container").on("click", function() {
  $("#heatmap-container").hide();
  $("#heatmap-statistics").hide();
  $("#hmDialog").show();
});
$("#heatmap-statistics").on("click", function() {
  $("#heatmap-statistics").hide();
});

// Initialize defaults
$("#hmUrl").val(hmUrl);
$("#hmUser").val(hmUser);
$("#hmPass").val(hmPass);
$("#hmTimeframe").val(hmTimeframe);
$("#hmQuery").val(allClicks);
$("#hmQueryShortcuts").append('<option value="AND data.clientDetails.osFamily:Windows">Windows</option>');
$("#hmQueryShortcuts").append("<option value='AND data.clientDetails.osFamily:\\\"OS X\\\"'>OS X</option>");
$("#hmQueryShortcuts").append('<option value="AND _exists_:data.visitTag">Logged in</option>');
$("#hmQueryShortcuts").append('<option value="AND _missing_:data.visitTag">Anonymous</option>');
$("#hmQueryShortcuts").append('<option value="AND data.userExperience:satisfied">Satisfied</option>');
$("#hmQueryShortcuts").append('<option value="AND data.userExperience:tolerating">Tolerating</option>');
$("#hmQueryShortcuts").append('<option value="AND data.userExperience:frustrated">Frustrated</option>');
$("#hmQueryShortcuts").append("<option value='AND data.location.continent:\\\"North America\\\"'>North America</option>");
$("#hmQueryShortcuts").append('<option value="AND data.location.continent:Europe">Europe</option>');
