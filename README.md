# Dynatrace-UEM-PureLytics-Heatmap
JavaScript Browser Extension to visualize UEM User Action Clicks as Heatmap. To be used with Browser Extensions such as [Greasemonkey](http://www.greasespot.net/)

## What this plugin can do?
Using [Dynatrace PureLytics Stream](https://community.dynatrace.com/community/display/DOCDT63/PureLytics+Stream) in combination with ElasticSearch it can pull in aggregated UEM Data such as "Clicks on Links on a certain page" and visualize these clicks as a heatmap in your browser!
![](https://github.com/Dynatrace/Dynatrace-UEM-PureLytics-Heatmap/blob/master/images/OverallHeatmap.png)

# How to get it setup?
## Step 1: Get Dynatrace installed
If you do not have Dynatrace simply [Register for Dynatrace Personal License](http://bit.ly/dtpersonal)! Follow the installation instructions on the [Dynatrace Free Trial Page](http://bit.ly/dttrial) - there are also [Online Video Tutorials](http://bit.ly/onlineperfclinic)

## Step 2: Setup PureLytics Stream
Simply follow the instructions on enabling [PureLytics Stream](https://community.dynatrace.com/community/display/DOCDT63/PureLytics+Stream) which will stream UEM data LIVE to your ElasticSearch instance

## Step 3: Install this plugin in your browser
This plugin was created for Greasemonkey but should work on any other simliar JavaScript browser extension plugin. Simply create a new User Script plugin - download and copy the content of [heatmap.js](https://github.com/Dynatrace/Dynatrace-UEM-PureLytics-Heatmap/blob/master/heatmap.js) into your custom user script. Now configure the script to be executed on the pages you want to generate the heatmap for.

## Step 4: Configure the script
Once the plugin is active on your page you will see a popup window with configuration parameters
