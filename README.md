# Dynatrace-UEM-PureLytics-Heatmap
JavaScript Browser Extension to visualize UEM User Action Clicks as Heatmap. To be used with Browser Extensions such as [Greasemonkey](http://www.greasespot.net/)

## What this plugin can do?
We are using Dynatrace UEM to monitor our own web sites such as our [about:performance blog](http://apmblog.dynatrace.com). Using [Dynatrace PureLytics Stream](https://community.dynatrace.com/community/display/DOCDT63/PureLytics+Stream) in combination with ElasticSearch we can pull aggregated UEM Data such as "Clicks on Links on a certain page" and visualize these clicks as a heatmap in your browser!
![](https://github.com/Dynatrace/Dynatrace-UEM-PureLytics-Heatmap/blob/master/images/HeatmapView.png)
This plugin is simply a JavaScript Browser Extension you can run in e.g: Greasemonkey. It will pull aggregated Dynatrace UEM data from ElasticSearch and visualizes it as a click heatmap.

# How to get it setup?
## Step 1: Get Dynatrace installed
If you do not have Dynatrace simply [Register for Dynatrace Personal License](http://bit.ly/dtpersonal)! Follow the installation instructions on the [Dynatrace Free Trial Page](http://bit.ly/dttrial) - there are also [Online Video Tutorials](http://bit.ly/onlineperfclinic)

## Step 2: Setup PureLytics Stream
Simply follow the instructions on enabling [PureLytics Stream](https://community.dynatrace.com/community/display/DOCDT63/PureLytics+Stream) which will stream UEM data LIVE to your ElasticSearch instance

## Step 3: Install this plugin in your browser
This plugin was created for Greasemonkey but should work on any other simliar JavaScript browser extension plugin. Simply create a new User Script plugin - download and copy the content of [heatmap.js](https://github.com/Dynatrace/Dynatrace-UEM-PureLytics-Heatmap/blob/master/heatmap.js) into your custom user script. Now configure the script to be executed on the pages you want to generate the heatmap for.

## Step 4: Configure the script
Once the plugin is active on your page you will see a popup window with configuration parameters. You need to configure your ElasticSearch API Endpoint, a potential username/password in case you require authentication, the query you want to execute and the timeframe of data you want to look at.
![](https://github.com/Dynatrace/Dynatrace-UEM-PureLytics-Heatmap/blob/master/images/PluginConfiguration.png)

# Additional use cases
Here are some additonal screenshot of use cases we also covered in our blog: http://apmblog.dynatrace.com
Just to give you some additonal ideas on what else is possible

## Click Behavior of Mac vs. Windows Visitors
![](https://github.com/Dynatrace/Dynatrace-UEM-PureLytics-Heatmap/blob/master/images/MacVsWindows.png)

## Click Behavior depending on User Experience
![](https://github.com/Dynatrace/Dynatrace-UEM-PureLytics-Heatmap/blob/master/images/ByUserIndex.png)

## Click Behavior depending on type of user
![](https://github.com/Dynatrace/Dynatrace-UEM-PureLytics-Heatmap/blob/master/images/FreeTrialEmployeesCustomerse.png)

## Click Behavior depending on initial landing page of the user
![](https://github.com/Dynatrace/Dynatrace-UEM-PureLytics-Heatmap/blob/master/images/GooglevsFreeTrialFAQ.png)
