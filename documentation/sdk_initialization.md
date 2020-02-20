# Setup And Initialization

## Installation
### Using script tag
Add the follwoing script tag to your html page insde the head or body tag.
Ideally, the tag should be included *before* your application scripts.

```
<!doctype html>
<html lang="en">
<head>
<!-- your existing markup -->

<!-- Include the OstWalletSdk script tag -->
<script type="text/javascript" src="https://stagingpepocoin.com/v-dev-6/OstWalletSdk.js" integrity="sha256-ldfK51rkO+hH50K75RHFgotOfkw38PFBcVXJwMKKrs4= sha384-lfvUG7q/D8GFW7kLghrnJgNQXAOwTMEKQ/8gdmEWzT9wSJrQ0c+cUeaFMbzzhnOf" crossorigin="anonymous"></script>

<!-- Your application js files -->
</head>
```

### Using it as npm module
Install the npm module
```
npm install @ostdotcom/ost-wallet-sdk-browser --save
```

Import `OstWalletSdk`
```
import OstWalletSdk from '@ostdotcom/ost-wallet-sdk-browser'
```


## Initializing the OstWalletSdk browser.
Sdk **must** be initialized **before** using any-other OstWalletSdk methods.
To initialize the sdk, create the sdk-configuration and invloke the `OstWalletSdk.init` method.
You will need following information to initialize the sdk:

* token_id - Id of your token.
* api_endpoint - Ost Platform Api Endpoint.
* sdk_endpoint - Endpoint to sdk's html page.


```
const sdkConfig = {
  "token_id": "[YOUR_TOKEN_ID]",
  "api_endpoint": "https://api.ost.com/testnet/v2/",
  "sdk_endpoint": "https://[YOUR_TOKEN_SDK_ENDPOINT]"
};
let OstWalletSdk.init( sdkConfig );
```




