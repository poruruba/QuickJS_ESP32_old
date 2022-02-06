import * as gpio from "gpio";

function setup(){
	var ipaddress = esp32.getIpAddress();
	console.log("ipaddress=" + ((ipaddress >> 24) & 0xff) + "." + ((ipaddress >> 16) & 0xff) + "." + ((ipaddress >> 8) & 0xff) + "." + (ipaddress & 0xff));
	
	gpio.pinMode(10, gpio.OUTPUT);
	gpio.digitalWrite(10, gpio.HIGH);
}

var led = false;

function loop(){
	led = !led;
	gpio.digitalWrite(10, led ? gpio.LOW : gpio.HIGH );
	delay(1000);
}
