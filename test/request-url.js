'use strict';

const request = require('../index.js');

if(process.env.TESTURL.match(/https\:\/\//)){
	request.https(process.env.TESTURL, 'GET')
	.then(res => console.log(res))
	.catch(err => console.log(err))
}else{
	request.http(process.env.TESTURL, 'GET')
	.then(res => console.log(res))
	.catch(err => console.log(err))
}
	