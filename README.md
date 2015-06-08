node-red-contrib-teslams
========================

Node-Red (http://nodered.org) nodes for communicating with a Tesla Model S electric car. 
Based on the teslams javascript libraries (https://github.com/hjespers/teslams).

<img src="https://github.com/hjespers/node-red-contrib-teslams/blob/master/Screen_Shot.png">

These programs and documentation do not come from Tesla Motors Inc.

Be careful when using these programs as they can lock and unlock your car as well as control various functions relating to the charging system, sun roof, headlights, horn, climate control, and other subsystems of the car.

Be careful not to send your login and password to anyone other than Tesla or you are giving away the authentication details required to control your car.

Also ensure that you don't overwhelm the Tesla servers with requests. Calling functions at very high frequency can put substantial load on the Tesla servers and might get your IP blocked by Tesla. Tesla might also reset your login for too many failed login attempts.


#Install

Run the following command in the root directory of your Node-RED install

    npm install node-red-contrib-teslams


#Usage

You will need a Tesla Model S. The ultimate "thing" to connect to the Internet of Things.
You will need an owners account on the Telsa Motors Inc. official web site (http://www.teslamotors.com) associated with your car(s).
Execute the "login" node at least once to get the appropriate security tokens for all the other nodes.
All nodes besides the "login" node require the vehicle "id" to be in the input msg.payload. 


#Disclaimer

Use these programs at your own risk. The author does not guaranteed the proper functioning of these applications. This code attempts to use the same interfaces used by the official Tesla phone apps. However, it is possible that use of this code may cause unexpected damage for which nobody but you are responsible. Use of these functions can change the settings on your car and may have negative consequences such as (but not limited to) unlocking the doors, opening the sun roof, or reducing the available charge in the battery.

#Author

Hans Jespersen, https://github.com/hjespers

#Feedback and Support

For more information, feedback, or community support see the Tesla Motors Club forum at http://www.teslamotorsclub.com/showthread.php/20325-TeslaMS-tools-for-telemetry-data-visualization or email teslams@googlegroups.com
