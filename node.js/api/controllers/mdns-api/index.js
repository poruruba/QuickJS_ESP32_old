'use strict';

const HELPER_BASE = process.env.HELPER_BASE || '../../helpers/';
const Response = require(HELPER_BASE + 'response');

const mdns = require('mdns');

exports.handler = async (event, context, callback) => {
	if( event.path == '/mdns-list'){
		var body = JSON.parse(event.body);
		console.log(body);
		var timeout = !body.timeout ? 5000 : body.timeout;
		var protocol = !body.protocol ? 'tcp' : body.protocol;

		var serviceType;
		if( protocol == 'tcp')
			serviceType = mdns.tcp(body.servicetype);
		else if( protocol == 'udp' )
			serviceType = mdns.udp(body.servicetype);
		else
			throw 'unknown protocol';

		const browser = mdns.createBrowser(serviceType);

		var list = [];
		browser.on('serviceUp', (service) =>{
//			console.log(service);
			var item = {
				name: service.name,
				address: service.addresses,
				port: service.port,
				host: service.host,
				fullname: service.fullname,
				servicetype: service.type.name,
				protocol: service.type.protocol,
			};
			list.push(item);
		});

		browser.start();

		return new Promise((resolve, reject) =>{
			setTimeout(() =>{
				browser.stop();
				resolve(new Response({ list: list }));
			}, timeout);
		});
	}
};
