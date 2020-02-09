# ost-wallet-sdk-browser

## Introduction
OST Wallet SDK Browser is a web application development SDK that enables developers to integrate the functionality of a non-custodial crypto-wallet into consumer applications.

## OST Wallet SDK Browser...
Safely generates and stores keys on the user's mobile device

## Support(Dependencies)
- npm 
- nginx

## Setup

### Add hosts

The `hosts` file is genererally located at:
```
/etc/hosts
```

Edit the `hosts` file:
```
sudo vi /etc/hosts
```

For development environment, 3 domains are needed. Add following hosts:
```
127.0.0.1 devmappy.com
127.0.0.1 sdk-devmappy.ostsdkproxy.com
127.0.0.1 km-devmappy.ostsdkproxy.com
127.0.0.1 demo-devmappy.stagingostproxy.com
127.0.0.1 api.stagingostproxy.com
```
> As webpack in breaks when routing through nginx in dev-environment, we shall server JS directly from webpack
> We shall use localhost:9090 for all Ost Hosted Scripts and localhost:9000 for Mappy JS Script.

https://css-tricks.com/getting-around-revoked-certificate-osx/


### Setup self-signed for nginx proxy.
Skip this step if you have already setup ssl on local nginx.
```
mkdir -p /usr/local/etc/nginx/dev-proxy-https-certificates/
cd /usr/local/etc/nginx/dev-proxy-https-certificates/
openssl req -new -newkey rsa:4096 -x509 -sha256 -days 365 -nodes -out dev-proxy-https.crt -keyout dev-proxy-https.key
```

### Add the self-signing certificate into Keychain Access
* Run the following command to locate your certificate in finder.
```
cd /usr/local/etc/nginx/dev-proxy-https-certificates/
open .
```
* Open System's **Keychain Access**
* Unlock **login** Keychains (left top pannel).
* Select **Certificates** in Category Pannel (left bottom pannel).
* Drag and drop the `dev-proxy-https.crt` from finder into the Keychain Access App.
* Right click on the added certificate.
* Choose **Get Info** to open the certificate information popup.
* Expand **Trust** in the certificate information popup.
* Set the 'When Using This Certificate:' option to `Always Trust`.
  > All other trust options should automatically be set to `Always Trust`.

More information is also available [here](https://css-tricks.com/getting-around-revoked-certificate-osx/).


### Setup Nginx 

#### Installation
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

The configuration is genererally located at:
```
/usr/local/etc/nginx/nginx.conf
```

Add the following server blocks to your nginx configuration:
```
http {
    
    ssl_certificate     /usr/local/etc/nginx/dev-proxy-https-certificates/dev-proxy-https.crt;
    ssl_certificate_key /usr/local/etc/nginx/dev-proxy-https-certificates/dev-proxy-https.key;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_protocols       TLSv1.1 TLSv1.2;

    # Other existing sever blocks
    # .
    # .
    # .  
    #


    #Server to route mappy HTML server calls.
    server {
        listen       443 ssl;
        server_name  devmappy.com;

        add_header 'Access-Control-Allow-Origin' 'https://demo-devmappy.stagingostproxy.com' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization,Accept,Origin,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range' always;
        add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;


        #Loading HTML and other static resources from webpack server.
        location / {

            if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' 'https://demo-devmappy.stagingostproxy.com' always;
                add_header 'Access-Control-Allow-Credentials' 'true' always;
                add_header 'Access-Control-Allow-Headers' 'Authorization,Accept,Origin,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range' always;
                add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;
                add_header 'Access-Control-Max-Age' 1728000;
                add_header 'Content-Type' 'text/plain charset=UTF-8';
                add_header 'Content-Length' 0;
                return 204;
            }
            proxy_pass http://localhost:9000/;
        }
    }

    # Mappy Api Server Reverse Proxy
    server {
        listen       443 ssl;
        server_name  demo-devmappy.stagingostproxy.com;

        add_header 'Access-Control-Allow-Origin' 'https://devmappy.com' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization,Accept,Origin,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range' always;
        add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;


        #Loading HTML and other static resources from webpack server.
        location / {
            if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' 'https://devmappy.com' always;
                add_header 'Access-Control-Allow-Credentials' 'true' always;
                add_header 'Access-Control-Allow-Headers' 'Authorization,Accept,Origin,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range' always;
                add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;

                add_header 'Access-Control-Max-Age' 1728000;
                add_header 'Content-Type' 'text/plain charset=UTF-8';
                add_header 'Content-Length' 0;
                return 204;
            }

            proxy_cookie_domain demo-mappy.stagingost.com demo-devmappy.stagingostproxy.com;
            proxy_pass https://demo-mappy.stagingost.com/;
        }
    }


    #Server to route sdk-devmappy.ostsdk iframe HTML server calls.
    server {
        listen       443 ssl;
        server_name  sdk-devmappy.ostsdkproxy.com;

        add_header 'Access-Control-Allow-Origin' 'https://api.stagingostproxy.com' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization,Accept,Origin,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range' always;
        add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;


        #Loading HTML and other static resources from webpack server.
        location / {

            if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' 'https://api.stagingostproxy.com' always;
                add_header 'Access-Control-Allow-Credentials' 'true' always;
                add_header 'Access-Control-Allow-Headers' 'Authorization,Accept,Origin,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range' always;
                add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;

                add_header 'Access-Control-Max-Age' 1728000;
                add_header 'Content-Type' 'text/plain charset=UTF-8';
                add_header 'Content-Length' 0;
                return 204;
            }
            proxy_pass http://localhost:9001/;
        }
    }

    #Server to route km-devmappy.ostsdk (Key-Manager) HTML server calls.
    server {
        listen       443 ssl;
        server_name  km-devmappy.ostsdkproxy.com;

        add_header 'Access-Control-Allow-Origin' 'https://api.stagingostproxy.com' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization,Accept,Origin,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range' always;
        add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;

        #Loading HTML and other static resources from webpack server.
        location / {
            if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' 'https://api.stagingostproxy.com' always;
                add_header 'Access-Control-Allow-Credentials' 'true' always;
                add_header 'Access-Control-Allow-Headers' 'Authorization,Accept,Origin,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range' always;
                add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;

                add_header 'Access-Control-Max-Age' 1728000;
                add_header 'Content-Type' 'text/plain charset=UTF-8';
                add_header 'Content-Length' 0;
                return 204;
            }
            proxy_pass http://localhost:9002/;
        }
    }


    # Ost Platform Api Server Reverse Proxy
    server {
        listen       443 ssl;
        server_name  api.stagingostproxy.com;

        add_header 'Access-Control-Allow-Origin' 'https://sdk-devmappy.ostsdkproxy.com' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization,Accept,Origin,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range' always;
        add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;

        #Loading HTML and other static resources from webpack server.
        location / {

            if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' 'https://sdk-devmappy.ostsdkproxy.com' always;
                add_header 'Access-Control-Allow-Credentials' 'true' always;
                add_header 'Access-Control-Allow-Headers' 'Authorization,Accept,Origin,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range' always;
                add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH' always;

                add_header 'Access-Control-Max-Age' 1728000;
                add_header 'Content-Type' 'text/plain charset=UTF-8';
                add_header 'Content-Length' 0;
                return 204;
            }

            proxy_cookie_domain api.stagingost.com api.stagingostproxy.com;
            proxy_pass https://api.stagingost.com/;
        }
    }
}
```

Stop nginx and restart it to apply configuration changes.
```
brew services stop nginx
```

```
brew services start nginx
```

### Install NPM Dependencies.
- To install all the dependencies, run following command:

```
npm install
```
If you don't have npm installed on your machine then go to https://www.npmjs.com/get-npm for installing npm and node.


## Set Environment variables and Fire Up the servers
- To run servers on browser, run command-
```
source ./set_env_vars.sh
npm run dev-servers
```
Replace file_name with your environment variables file name.

### Grant permission to all proxied domains.
Open the follwoing links in browser and grant permission
> Click on `Proceed to...` On Chrome
>
> Click on `Accept Risk and Continue` on Firefox
* [https://api.stagingostproxy.com/testnet/v2/tokens](https://api.stagingostproxy.com/testnet/v2/token)
* [https://km-devmappy.ostsdkproxy.com/](https://km-devmappy.ostsdkproxy.com/)
* [https://sdk-devmappy.ostsdkproxy.com/](https://sdk-devmappy.ostsdkproxy.com/)
* [https://demo-devmappy.stagingostproxy.com](https://demo-devmappy.stagingostproxy.com)
* [https://devmappy.com](https://devmappy.com)

### Testing
Open the browser and access [https://devmappy.com/](https://devmappy.com/).




