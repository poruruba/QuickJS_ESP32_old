import * as http from "http";
import * as input from "input";
import * as utils from "utils";
import * as gpio from "gpio";

const X_AUTH_TOKEN = "【Beebotteのチャネルトークン 】";

async function setup()
{
	var ipaddress = esp32.getIpAddress();
	console.log("ipaddress=" + ((ipaddress >> 24) & 0xff) + "." + ((ipaddress >> 16) & 0xff) + "." + ((ipaddress >> 8) & 0xff) + "." + (ipaddress & 0xff));

	gpio.pinMode(36, gpio.INPUT);
}

var pir = -1;
async function loop()
{
	esp32.update();
	if( input.isPressed(input.BUTTON_B) ){
		esp32.restart();
	}
	
	var t = gpio.digitalRead(36);
	if( t != pir ){
		pir = t;
		console.log("PIR=" + pir);
//		var result2 = http.postJson("http://api.beebotte.com/v1/data/write/pir", { records: [{ "resource": "pir", data: (pir != 0) }]}, { "X-Auth-Token": X_AUTH_TOKEN } );
		var result2 = utils.httpPostJson("http://api.beebotte.com/v1/data/write/pir", { records: [{ "resource": "pir", data: (pir != 0) }]}, { "X-Auth-Token": X_AUTH_TOKEN } );
		console.log(JSON.stringify(result2));
	}
}
