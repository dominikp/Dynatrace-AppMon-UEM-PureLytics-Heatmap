// ==UserScript==
// @name        Click Heatmap
// @namespace   Dynatrace
// @version     1
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js
// @require     https://github.com/pa7/heatmap.js/raw/master/build/heatmap.js
// @resource    hmDialog https://cloud.punz.org/index.php/s/DA6CPTA46Qut9FY/download?nocache=0
// @grant       GM_getResourceText
// ==/UserScript==

var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
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

function getAuthorizationHeader(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
}

function drawHeatmap(links) {
    // minimal heatmap instance configuration
    var heatmapInstance = h337.create({
      // only container is required, the rest will be defaults
      container: document.querySelector('#heatmap-container')
    });

    // now generate some random data
    var points = [];
    var max = 0;

    for (i in links) {
      $("a:contains('" + i + "'), input[value='" + i + "']").each(function (index, elem) {        
        for (j = 0; j < links[i]; ++j) {
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

function downloadClickData(searchUrl, user, pass, query, timeframeDays) {
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
    $("#heatmap-statistics").append("Download success: " + data.aggregations.NAME.buckets.length + " user actions<br>");
    console.log(data);
    var links = {};
    var clicks = 0;
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
      }
    }
    $("#heatmap-statistics").append("Found " + clicks + " clicks<br>");
    $("#heatmap-statistics").append("Top click: " + topClick + "(" + topClickCount + ")");
     drawHeatmap(links);
  }).fail(function(xhr, status, error) {
    $("#heatmap-statistics").append("Request failed: " + error + "<br>");
  }).always(function() {
    $("#heatmap-spinner").hide();
  });
}

$("body").append("<image id='heatmap-spinner' src='https://cloud.punz.org/index.php/s/4yanL40CwcOMV74/download' style='display:none; position:fixed; left:45%; top: 45%'; z-index:1000000000;'></image>");
$("body").append("<div id='heatmap-container' style='display:none;position:absolute;left:0;top:0;width:100%;height:100%;z-index:10000000'></div>");
$("body").append("<div id='heatmap-statistics' style='display:none;position:absolute;left:10px;bottom:10px;background-color:#00A6FA;box-shadow:3px 3px 9px 0px rgba(0,0,0,0.75);color:#FFF;font-size:12px;padding:8px;z-index:10000000'>Statistics go here...</div>");
$("body").append(GM_getResourceText("hmDialog"));
$("#hmQuery").val(allClicks);
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
  downloadClickData(searchUrl, user, pass, query, timeframeDays);
});
$("#heatmap-container").on("click", function() {
  $("#heatmap-container").hide();
  $("#heatmap-statistics").hide();
  $("#hmDialog").show();
});
$("#heatmap-statistics").on("click", function() {
  $("#heatmap-statistics").hide();
});