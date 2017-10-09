'use strict';

require('dotenv').config();
const nodeHttp = require('http');
const nodeHttps = require('https');
const log = require('debug')('[request-promise]');
const error = require('debug')('[request-promise] Error:');
const httpsProxyAgent = require('https-proxy-agent'); 

exports.http = (url, method, data, useragent, port) => {
    return new Promise( (resolve, reject) => {
        let path;
        let domain;
        
        if(!port){
            port = 80;    
        }

        if(url.match(/:\/\//)){
            path = url.replace(/^http?:?\/\/[^/]+(.*)/,'$1');
            domain = url.replace(/http?:?\/\/([^/]+).*/,'$1');
            if(domain.match(/:/)){
                domain = domain.split(':');
                port = domain[1];
                domain = domain[0];
            }
        }else{
            path = url.replace(/^[^/]+(.*)/,'$1');
            domain = url.replace(/(^[^/]+).*/,'$1');
        }

        log(`http ${method} ${url}`);

        let options;
        if( process.env.PROXY_HOST ){
            let proxyIp = process.env.PROXY_HOST.replace('http://','');
            options = {
                host: proxyIp,
                port: process.env.PROXY_PORT,
                method: method,
                path: 'http://' + domain + path,
                headers: {
                    Host: domain
                }
            };
            
            if(useragent){
                options.headers['User-Agent'] = useragent;
            }
        }else{
            options = {
                host: domain,
                port: port,
                method: method,
                path: path
            };

            if(useragent){
                options.headers = {};
                options.headers['User-Agent'] = useragent;
            }
        }
        
        let req = nodeHttp.request(options, res => {
            res.setEncoding('utf8');
            let body = '';

            switch(res.statusCode){
                case 500 :
                    req.abort();
                    return reject('500 Internal Server Error');
                break;
                case 404 :
                    req.abort();
                    return reject('404 Not Found');
                break;
            }

            res.on('data', chunk => {          
                body += chunk;
            }); 

            res.on('end', () => { 
                return resolve(body); 
            });
        });

        req.on('error', e => {
            error(`\nErro em request http ${method} URL: ${url}, PATH: ${path}\n`);
            req.abort();
            return reject(e);
        });
        
        if(data && method == 'POST'){
            req.write(JSON.stringify(data));
        }

        req.end();
    });
};


exports.https = (url, method, data, useragent, port) => {
    return new Promise( (resolve, reject) => {
        let path;
        let domain;
        
        if(!port){
            port = 443;    
        }

        if(url.match(/:\/\//)){
            path = url.replace(/^https?:?\/\/[^/]+(.*)/,'$1');
            domain = url.replace(/https?:?\/\/([^/]+).*/,'$1');
            if(domain.match(/:/)){
                domain = domain.split(':');
                port = domain[1];
                domain = domain[0];
            }
        }else{
            path = url.replace(/^[^/]+(.*)/,'$1');
            domain = url.replace(/(^[^/]+).*/,'$1');
        }

        log(`https ${method} ${url}`);      

        let options;
        if(method == 'GET'){    
            options = {
                host: domain,
                path: path,
                port: port,
                method: method,
                headers: {
                  'Content-Type': 'application/json'
                }
            };
        }else if(method == 'POST'){
            options = {
                hostname: domain,
                path: path,
                port: port,
                method: method,
                headers: {
                  'Content-Type': 'application/json'
                },
                timeout: 5000,
            };
        }else{
            return reject('[request-promise] Erro: método de request não suportado');
        }

        if(useragent){
            options.headers['User-Agent'] = useragent;
        }

        // Se tem confg de proxy hostname e path mudam
        if( process.env.PROXY_HOST ){   
            let agent = new httpsProxyAgent( process.env.PROXY_HOST + ':' + process.env.PROXY_PORT );
            options['agent'] = agent; 
        }

        let req = nodeHttps.request(options, res => {
            res.setEncoding('utf8');
            
            switch(res.statusCode){
                case 500 :
                    req.abort();
                    return reject('500 Internal Server Error');
                break;
                case 404 :
                    req.abort();
                    return reject('404 Not Found');
                break;
            }

            let body = '';
            res.on('data', chunk => {          
                body += chunk;
            }); 

            res.on('end', () => { return resolve(body); });
        });

        req.on('error', e => {
            error(`\nErro em request https ${method} URL: ${url}, DOMAIN: ${domain}, PATH: ${path}\n`);
            req.abort();
            return reject(e);
        });

        if(data && method == 'POST'){
            req.write(JSON.stringify(data));
        }

        req.end();
    });
};
