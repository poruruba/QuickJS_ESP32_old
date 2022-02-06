'use strict';

const HELPER_BASE = process.env.HELPER_BASE || '../../helpers/';
const Response = require(HELPER_BASE + 'response');
const TextResponse = require(HELPER_BASE + 'textresponse');
const BinResponse = require(HELPER_BASE + 'binresponse');

const { URLSearchParams } = require('url');
const fetch = require('node-fetch');
const Headers = fetch.Headers;

exports.handler = async (event, context, callback) => {
	switch(event.path){
		case '/httpproxy-call':{
			var body = JSON.parse(event.body);
			console.log(body.method, body.url, body.params, body.headers, body.response_type, body.method);
			var result;
			switch(body.method){
				case 'POST':{
					result = await do_post(body.url, body.params, body.headers, body.response_type);
					break;
				}
				case 'POST_FORM':{
					result = await do_post_form(body.url, body.params, body.headers, body.response_type);
					break;
				}
				case 'GET':{
					result = await do_get(body.url, body.params, body.headers, body.response_type);
					break;
				}
				default:
					throw "unknown method";
			}

			if (body.response_type == 'TEXT')
				return new TextResponse("text/plain", result);
			else if (body.response_type == 'BINARY')
				return new BinResponse("application/octet-stream", Buffer.from(result));
			else
				return new Response(result);
		}
	}
};

function do_post(url, body, header, response_type = 'JSON') {
	const headers = new Headers(header);
	headers.append("Content-Type", "application/json");

	return fetch(url, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: headers
	})
		.then((response) => {
			if (!response.ok)
				throw 'status is not 200';

			if (response_type == 'TEXT')
				return response.text();
			else if (response_type == 'BINARY')
				return response.arrayBuffer();
			else
				return response.json();
		});
}

function do_post_form(url, params, header, response_type = 'JSON'){
    var data = new URLSearchParams();
    for( var name in params )
        data.append(name, params[name]);

    const headers = new Headers(header);
    headers.append("Content-Type", 'application/x-www-form-urlencoded');
    
    return fetch(url, {
        method : 'POST',
        body : data,
        headers: headers
    })
    .then((response) => {
        if( !response.ok )
            throw 'status is not 200';

		if (response_type == 'TEXT')
			return response.text();
		else if (response_type == 'BINARY')
			return response.arrayBuffer();
		else
			return response.json();
    })
}

function do_get(url, qs, header, response_type = 'JSON') {
	const params = new URLSearchParams(qs);
	const headers = new Headers(header);

	var append_params = params.toString();
	if (append_params ){
		url += (url.indexOf('?') >= 0) ? "&" : "?";
		url += append_params;
	}
	return fetch(url, {
		method: 'GET',
		headers: headers
	})
		.then((response) => {
			if (!response.ok)
				throw 'status is not 200';

			if (response_type == 'TEXT')
				return response.text();
			else if (response_type == 'BINARY')
				return response.arrayBuffer();
			else
				return response.json();
		});
}
