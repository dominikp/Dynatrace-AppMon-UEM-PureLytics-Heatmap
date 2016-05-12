// ==UserScript==
// @name        Dynatrace Heatmap
// @namespace   Dynatrace
// @version     1
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js
// @require     https://github.com/pa7/heatmap.js/raw/master/build/heatmap.js
// @resource    hmDialog https://raw.githubusercontent.com/dominikp/Dynatrace-Heatmap/master/heatmap-dialog.html
// @grant       GM_getResourceText
// ==/UserScript==

// change the defaults here:
var hmUrl = "XXX";
var hmUser = "XXX";
var hmPass = "XXX";
var hmTimeframe = 14;
var allClicks = "_type:useraction AND data.source.url: \\\"" + window.location + "\\\"";

var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

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

function getAuthorizationHeader(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
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
      try {
        elems = $("a:contains('" + currentLink + "'), input[value='" + currentLink + "']");
      } catch (e) {
        console.log(e);
      }
      if (elems.length == 0) {
        $("#heatmap-statistics").append("Could not find " + i + " (" + links[i] + ")<br>");
      }
      elems.each(function (index, elem) {
        var visible = $(elem).is(":visible"); 
        var offsetVisible = ($(elem).offsetParent().width() > $(elem).offset().left && $(elem).offsetParent().height() > $(elem).offset().top);
        if (showHidden || (visible && offsetVisible)) for (j = 0; j < links[i]; ++j) {
            var val = links[i] + 800; // add an offset to make all links visible
            max = Math.max(max, val);
      
            var point = {
              x: $(elem).offset().left + Math.floor(Math.random() *  $(elem).width()),
              y: $(elem).offset().top + Math.floor(Math.random() *  $(elem).height()),
              value: val
            };
            points.push(point);
        }
      });
      
    }
    // heatmap data format
    var data = { 
      max: max, 
      data: points 
    };
    // if you have a set of datapoints always use setData instead of addData
    // for data initialization
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
  var LINK_REGEX = /click on \"(.*)\"/g;
  $.ajax({
    url: searchUrl,
    type: "post",
    xhrFields: { withCredentials: true },
    data: createJSONQuery(query, 1000*60*60*24*timeframeDays), // last 2 weeks
    dataType: "json",
    beforeSend: function(xhr) { 
      xhr.setRequestHeader("Authorization", getAuthorizationHeader(user, pass));
    }
  }).done(function(data) {
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
    drawHeatmap(links, showHidden);
  }).fail(function(xhr, status, error) {
    $("#heatmap-statistics").append("Request failed: " + error + "<br>");
  }).always(function() {
    $("#heatmap-spinner").hide();
  });
}

// DOM
$("body").append("<image id='heatmap-spinner' src='https://raw.githubusercontent.com/dominikp/Dynatrace-Heatmap/master/loader.gif' style='display:none; position:fixed; left:45%; top: 45%'; z-index:1000000000;'></image>");
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
