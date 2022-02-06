import * as gpio from "gpio";
import * as input from "input";

function setup(){
	var ipaddress = esp32.getIpAddress();
	console.log("ipaddress=" + ((ipaddress >> 24) & 0xff) + "." + ((ipaddress >> 16) & 0xff) + "." + ((ipaddress >> 8) & 0xff) + "." + (ipaddress & 0xff));
	
	gpio.pinMode(10, gpio.OUTPUT);
	gpio.digitalWrite(10, gpio.LOW);
}

var led = true;

function loop(){
	esp32.update();
	
	if(input.wasPressed(input.BUTTON_A)){
		console.log('wasPressed');
		led = !led;
		gpio.digitalWrite(10, led ? gpio.LOW : gpio.HIGH );
	}
}
