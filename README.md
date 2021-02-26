# realtime-broadcast-sdk
SDK for building a realtime broadcaster using the Millicast platform.

## / broadcaster-example

This is essentially our current SDK which was derived from an barebone example.

[https://github.com/millicast/millicast_javascript_demo](https://github.com/millicast/millicast_javascript_demo)

This has all the millicast webrtc features you need to build a real broadcaster and viewer (no av1, or live chat yet).  It is made with very minimal design and styles, including a publishing side and a scaled down viewing client as well.  This is missing the upper level features like realtime cam/mic swtiching, auto connecting etc..  

## / website-demo

[https://demo.millicast.com/?codec=h264&nosimulcast](https://demo.millicast.com/?codec=h264&nosimulcast)

This is our current live demo that is styled and designed to fit our brand.  This matches closer to our hosted broadcaster that is on our dash with more upper level controls like camera switching etc.  Since this was public we used an external server counterpart to proxy the connection in order to protect our credentials from rogue users.

