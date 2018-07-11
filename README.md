# Dynatrace-UEM-PureLytics-Heatmap
JavaScript Browser Extension to visualize UEM User Action Clicks as Heatmap. To be used with Browser Extensions such as [Tampermonkey](https://tampermonkey.net/)

Also make sure to check out more information about this and other extensions on our [Dynatrace Community Portal](https://community.dynatrace.com/community/display/DL/UEM+PureLytics+Heatmap).

## What this plugin can do?
We are using Dynatrace UEM to monitor our own web sites such as our [about:performance blog](http://apmblog.dynatrace.com/2016/05/26/using-heat-maps-to-understanding-how-your-users-tick/). Using [Dynatrace PureLytics Stream](https://community.dynatrace.com/community/display/DOCDT63/PureLytics+Stream) in combination with ElasticSearch we can pull aggregated UEM Data such as "Clicks on Links on a certain page" and visualize these clicks as a heatmap in your browser!
![](https://github.com/Dynatrace/Dynatrace-UEM-PureLytics-Heatmap/blob/master/images/HeatmapView.png)
This plugin is simply a JavaScript Browser Extension you can run in e.g: Tampermonkey. It will pull aggregated Dynatrace UEM data from ElasticSearch and visualizes it as a click heatmap.

# How to get it setup?
## Step 1: Get Dynatrace installed
If you do not have Dynatrace simply [Register for Dynatrace Personal License](http://bit.ly/dtpersonal)! Follow the installation instructions on the [Dynatrace Free Trial Page](http://bit.ly/dttrial) - there are also [Online Video Tutorials](http://bit.ly/onlineperfclinic)

## Step 2: Setup PureLytics Stream
Simply follow the instructions on enabling [PureLytics Stream](https://community.dynatrace.com/community/display/DOCDT63/PureLytics+Stream) which will stream UEM data LIVE to your ElasticSearch instance

## Step 3: Install this plugin in your browser
This plugin was created for Tampermonkey but should work on any other simliar JavaScript browser extension plugin. 
Here are the 3 steps to get it running:
* Install the user script: [heatmap.user.js](https://github.com/Dynatrace/Dynatrace-UEM-PureLytics-Heatmap/releases/download/v1.0/heatmap.user.js)
  * Tampermonkey will automatically ask you to install the script.
* Ensure that your Elastic search cluster allows CORS requests
* Set the URL where you want to run this script to the `@match` variable inside the `==/UserScript==` section.
* Change 3 default parameters in the top section of your script
  * Elasticsearch URL: e.g. `https://<yourserver>/dt*/_search`
  * Username (basic authentication)
  * Password (basic authentication)

## Step 4: Configure the script
Once the plugin is active on your page you will see a popup window with configuration parameters. If you have set default values for ElasticSearch URL, username and password then you are ready to go. Otherwise just set these values in the configuration dialog:
![](https://github.com/Dynatrace/Dynatrace-UEM-PureLytics-Heatmap/blob/master/images/PluginConfiguration.png)

## Step 5: Run it
Navigate the browser to your web application that is monitored with AppMon UEM. In the popup window select "Generate heatmap". The heatmap will be rendered directly on your page.

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
