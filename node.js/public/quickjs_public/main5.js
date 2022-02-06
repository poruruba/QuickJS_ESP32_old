import * as lcd from "lcd";
import * as rtc from "rtc";

var width, height;
var last_update = -1;
var last_minutes = -1;

async function setup()
{
	var ipaddress = esp32.getIpAddress();
	console.log("ipaddress=" + ((ipaddress >> 24) & 0xff) + "." + ((ipaddress >> 16) & 0xff) + "." + ((ipaddress >> 8) & 0xff) + "." + (ipaddress & 0xff));

	lcd.downloadImage('http://ÅyWebÉTÅ[ÉoÇÃURLÅz/sky_160x80.jpg');
	
	width = lcd.width();
	height = lcd.height();
	
	lcd.setTextColor(0x0000ff);
	lcd.setTextSize(3.5);
    lcd.setTextDatum(lcd.middle_left);
}

function to2d(val){
	return ('00' + val).slice(-2);
}

async function loop()
{
	var now = millis();
	if( last_update < 0 || now - last_update >= 10000){
		last_update = now;
		
		var time = rtc.getTime();
		if( last_minutes < 0 || time.Minutes != last_minutes ){
			last_minutes = time.Minutes;
			
			lcd.drawImage(0, 0);
		
			var str = to2d(time.Hours) + ':' + to2d(time.Minutes);
			console.log(str);
			
		    lcd.setCursor((width - lcd.textWidth(str)) / 2, height / 2);
		    lcd.print(str);
		}
	}
}
