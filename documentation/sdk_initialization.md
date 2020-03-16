# Setup And Initialization

## Installation
### Using script tag
Add the follwoing script tag to your html page inside the head or body tag.

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

* `token_id` - Id of your token.
* `environment` - Ost Platform Environment. Can be `mainnet` or `testnet`.
* `create_session_qr_timeout` - Time in seconds (defaults to 3 hours) till when Sdk will check if session has been authorized. If this timeout is reached, the browser sdk shall declare the authorize session workflow as interupted.
* `max_workflow_retention_count` - No. of completed workflows, workflows with status `flowCompleted` or `flowInterupted` that should be retained in browser's DB. Defaults to 50.


```
const sdkConfig = {
  "token_id": "[YOUR_TOKEN_ID]",
  "environment": "[OST_PLATFORM_ENVIRONMENT]"
};
let OstWalletSdk.init( sdkConfig );
```