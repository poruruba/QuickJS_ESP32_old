function setup(){
	var ipaddress = esp32.getIpAddress();
	console.log("ipaddress=" + ((ipaddress >> 24) & 0xff) + "." + ((ipaddress >> 16) & 0xff) + "." + ((ipaddress >> 8) & 0xff) + "." + (ipaddress & 0xff));
}

var counter = 0;
function loop(){
	console.log('hello ' + counter++);
	delay(1000);
}
