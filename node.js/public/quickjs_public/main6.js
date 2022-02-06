import * as lcd from "lcd";
import * as gpio from "gpio";
import * as input from "input";
import * as mqtt from "mqtt";

var width, height;
var model;
var modelName = "OTHER";
var onoff = false;
const topic = "m5/test";

async function setup()
{
	var ipaddress = esp32.getIpAddress();
	console.log("ipaddress=" + ((ipaddress >> 24) & 0xff) + "." + ((ipaddress >> 16) & 0xff) + "." + ((ipaddress >> 8) & 0xff) + "." + (ipaddress & 0xff));

	width = lcd.width();
	height = lcd.height();
	
	lcd.setTextColor(0xffffff);
        lcd.setTextDatum(lcd.middle_left);

	model = esp32.getDeviceModel();
	if( model == esp32.MODEL_M5StickC ){
		modelName = "M5StickC";
		lcd.setTextSize(2);
		gpio.pinMode(10, gpio.OUTPUT);
		gpio.digitalWrite(10, onoff ? gpio.LOW : gpio.HIGH);
	}else if( model == esp32.MODEL_M5Core2 ){
		modelName = "M5Core2";
		lcd.setTextSize(3.5);
		lcd.fillScreen(onoff ? 0xff00ff : 0x000000);
	}

	lcd.setCursor((width - lcd.textWidth(modelName)) / 2, height / 2);
	lcd.print(modelName);

	mqtt.connect(modelName);
	mqtt.subscribe(topic, () => {
		var payload = mqtt.getPayload();
		console.log("received(" + payload.topic + "): " + payload.payload );
		
		if( model == esp32.MODEL_M5StickC ){
			onoff = !onoff;
			gpio.digitalWrite(10, onoff ? gpio.LOW : gpio.HIGH);
		}else if( model == esp32.MODEL_M5Core2 ){
			onoff = !onoff;
			lcd.fillScreen(onoff ? 0xff00ff : 0x000000);
			lcd.setCursor((width - lcd.textWidth(modelName)) / 2, height / 2);
			lcd.print(modelName);
		}
	});
}

async function loop()
{
	esp32.update();

	if( model == esp32.MODEL_M5StickC ){
		if( input.wasPressed(input.BUTTON_A) ){
			console.log("wasPressed");
			mqtt.publish(topic, "hello " + modelName );
		}
	}else if( model == esp32.MODEL_M5Core2 ){
		if( input.isTouched() ){
			console.log("isTouched");
			mqtt.publish(topic, "hello " + modelName );
		}
	}
}
