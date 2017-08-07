'use strict';

const expect = require('chai').expect;
const request = require('../index.js');

describe('HTTP',() => {
    describe('GET',() => {
    	it('Should make a successful HTTP GET request', () => {
    		return request.http('http://httpbin.org/get', 'GET');
    	});    
    });
    describe('POST',() => {
    	it('Should make a successful HTTP POST request', () => {
    		return request.http('http://httpbin.org/post', 'POST', {test: 'post'});
    	}); 
    });
});
describe('HTTPS',() => {
    describe('GET',() => {
    	it('Should make a successful HTTPS GET request', () => {
    		return request.https('http://httpbin.org/get', 'GET');
    	});   
    });
    describe('POST',() => {
    	it('Should make a successful HTTPS POST request', () => {
    		return request.https('http://httpbin.org/post', 'POST', {test: 'post'});
    	}); 
    });
});