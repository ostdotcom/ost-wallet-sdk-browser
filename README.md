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
127.0.0.1 sdk-devmappy.devost.com
127.0.0.1 km-devmappy.devost.com
```

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
    
    # Other existing sever blocks
    # .
    # .
    # .  
    #

    #Server to route mappy server api calls.
    server {
        listen       8888;
        server_name  localhost;

        #API calls to remote demo mappy server.
        location /demo/api/ {
           proxy_cookie_domain demo-mappy.stagingost.com localhost;
           proxy_pass https://demo-mappy.stagingost.com/demo/api/;
        }

        #Loading HTML and other static resources from webpack server.
        location / {
            proxy_pass http://localhost:9000/;
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

## Fire Up the servers
- To run servers on browser, run command-
```
npm run dev-servers
```

Open the browser and access [http://devmappy.com:8080/](http://devmappy.com:8080/).





