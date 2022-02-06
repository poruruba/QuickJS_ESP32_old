'use strict';

const HELPER_BASE = process.env.HELPER_BASE || '../../helpers/';
const Response = require(HELPER_BASE + 'response');

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;

const MQTT_SUBSCRIBE_NOTIFY_TOPIC = "esp32_webapi_notify";
const MQTT_SUBSCRIBE_PUSH_TOPIC = "esp32_webapi_push";
const DEFAULT_TIMEOUT = 60 * 1000;

const UDP_NOTIFY_PORT = 3333;
const UDP_PUSH_PORT = 3334;

const dgram = require('dgram');
const mqtt = require('mqtt')
const fetch = require('node-fetch');
const Headers = fetch.Headers;

let mqtt_client = mqtt.connect(MQTT_BROKER_URL);
let mqtt_msgId = 0;
let requestMap = new Map();

const udpSocket = dgram.createSocket('udp4');
const udpPushSocket = dgram.createSocket('udp4');

udpSocket.on('listening', () => {
	const address = udpSocket.address();
	console.log('UDP udpSocket listening on ' + address.address + ":" + address.port);
});

udpSocket.on('message', (message, remote) => {
	console.log("(udp notify)" + remote.address + ':' + remote.port +' - ' + message);

	var body = JSON.parse(message);
	if( requestMap.get(body.msgId) ){
		var obj = requestMap.get(body.msgId);
		obj.resolve(new Response({ status: body.status, result: body.result }));
		requestMap.delete(body.msgId);
	}else{
		console.error('requestMap not found');
	}
	cleanUpRequestMap();
});

udpPushSocket.on('message', (message, remote) => {
	console.log("(udp push)" + remote.address + ':' + remote.port +' - ' + message);

	var body = JSON.parse(message);
	console.log("UDP_PUSH_TOPIC", body);

	do_post(body.url, body);
});

udpSocket.bind(UDP_NOTIFY_PORT);
udpPushSocket.bind(UDP_PUSH_PORT);

exports.handler = async (event, context, callback) => {
	if( event.path.startsWith("/mqttapi/")){
		var body = JSON.parse(event.body);
		var endpoint = event.path.substr("/mqttapi".length);
		var topic = event.queryStringParameters.topic;
		var oneway = event.queryStringParameters.oneway;
		if( body.topic )
			topic = body.topic;
		if( body.oneway )
			oneway = body.oneway;

		cleanUpRequestMap();

		var msgId = ++mqtt_msgId;

		var message = {
			endpoint: endpoint,
			topic: MQTT_SUBSCRIBE_NOTIFY_TOPIC,
			msgId: msgId,
			params: body,
			oneway: oneway
		};

		if( !message.oneway ){
			return new Promise((resolve, reject) =>{
				requestMap.set(msgId, { resolve, reject, created_at: new Date().getTime() });
				mqtt_client.publish(topic, JSON.stringify(message));
			});
		}else{
			mqtt_client.publish(topic, JSON.stringify(message));
			return new Response({status: "OK" });
		}
	}else
	if( event.path.startsWith("/udpapi/")){
		var body = JSON.parse(event.body);
		var endpoint = event.path.substr("/udpapi".length);
		var target = event.queryStringParameters.target;
		var oneway = event.queryStringParameters.oneway;
		if( body.target )
			target = body.target;
		if( body.oneway )
			oneway = body.oneway;

		cleanUpRequestMap();

		var msgId = ++mqtt_msgId;

		var message = {
			endpoint: endpoint,
			msgId: msgId,
			params: body,
			oneway: oneway
		};

		if( !message.oneway ){
			return new Promise((resolve, reject) =>{
				requestMap.set(msgId, { resolve, reject, created_at: new Date().getTime() });

				udpSocket.send(JSON.stringify(message), UDP_NOTIFY_PORT, target, (err) =>{
					if( err ){
						requestMap.delete(msgId);
						resolve(new Response({status: "NG" }));
					}
				});
			});
		}else{
			udpSocket.send(JSON.stringify(message), UDP_NOTIFY_PORT, target, (err) =>{
				if( err )
					return new Response({status: "NG" });
				return new Response({status: "OK" });
			});
		}
	}
};

exports.trigger = async (event, context) => {
	if( context.topic == MQTT_SUBSCRIBE_NOTIFY_TOPIC){
		var body = JSON.parse(event);
		if( requestMap.get(body.msgId) ){
			var obj = requestMap.get(body.msgId);
			obj.resolve(new Response({ status: body.status, result: body.result }));
			requestMap.delete(body.msgId);
		}else{
			console.error('requestMap not found');
		}
		cleanUpRequestMap();
	}else
	if( context.topic == MQTT_SUBSCRIBE_PUSH_TOPIC ){
		var body = JSON.parse(event);
		console.log("MQTT_SUBSCRIBE_PUSH_TOPIC", body);

		await do_post(body.url, body);
	}
};

function cleanUpRequestMap(){
	var now = new Date().getTime();
	requestMap.forEach((value, key) => {
		if( value.create_at < now - DEFAULT_TIMEOUT ){
			value.reject("timeout");
			requestMap.delete(key);
			console.log("timeout deleted(" + key + ")");
		}
	});
}

function do_post(url, body) {
  const headers = new Headers({ "Content-Type": "application/json" });

  return fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers
    })
    .then((response) => {
      if (!response.ok)
        throw 'status is not 200';
      return response.json();
    });
}