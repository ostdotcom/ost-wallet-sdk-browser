# ost-wallet-sdk-browser

## Introduction
OST Wallet SDK Browser is a web application development SDK that enables developers to integrate the functionality of a non-custodial crypto-wallet into consumer applications.

## OST Wallet SDK Browser...
Safely generates and stores keys on the user's mobile device

## Support(Dependencies)
- npm 
- nginx

## Setup-
- To install all the dependencies, run following command-

```
npm install
```
(If you don't have npm installed on your machine then go to https://www.npmjs.com/get-npm for installing npm and node.

- To run servers on browser, run command-
```
npm run develop-all
```
## Nginx 
- As browser doesn't allow cross domain cookie storage, nginx is used as the medium between the client application and server application.
### Installation
- on Mac
	```
	brew install nginx
	```
- To start and stop nginx -
```
brew services start nginx
brew services stop nginx
```
	
#### Nginx Configuration 
- Do the following changes to nginx.conf file 
```
   server {
        listen       8080;
        server_name  devmappy.com;
        location /demo/api/ {
           proxy_cookie_domain demo-mappy.stagingost.com devmappy.com;
           proxy_pass https://demo-mappy.stagingost.com/demo/api/;
        }
        location / {
            proxy_pass http://localhost:9000/;
        }
    }
```


