import * as wire from "wire";
import SHT30 from "SHT30";
import BMP280 from "BMP280";

var sht30;
var bmp280;

async function setup()
{
	var ipaddress = esp32.getIpAddress();
	console.log("ipaddress=" + ((ipaddress >> 24) & 0xff) + "." + ((ipaddress >> 16) & 0xff) + "." + ((ipaddress >> 8) & 0xff) + "." + (ipaddress & 0xff));

    wire.begin(0, 26);

    sht30 = new SHT30(wire);
    bmp280 = new BMP280(wire);
	await bmp280.begin();
}

async function loop()
{
	await sht30.get();
    console.log("cTemp=" + sht30.cTemp.toFixed(2));
    console.log("fTemp=" + sht30.fTemp.toFixed(2));
    console.log("humidity=" + sht30.humidity.toFixed(2));

    var tmp = bmp280.readTemperature();
    console.log("Temperature=" + tmp);
    var press = bmp280.readPressure();
    console.log("Pressure=" + press.toFixed(2));
    console.log("");

	delay(1000);
}
