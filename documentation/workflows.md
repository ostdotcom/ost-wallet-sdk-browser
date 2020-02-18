# Ost Wallet Browser Sdk Workflows

Workflows are a sequency of tasks that need to performed to achive the intended outcome.
Ost Wallet Browser Sdk supports following workflows:

## Setup Device Workflow
This workflow enables the browser-sdk to communicate with the Ost Platform and should be performed on every page load. Follow the these steps to perform setup device workflow.
### Create an object of setup device workflow delegate,
```
    let sdkDelegate =  new OstSetupDeviceDelegate();
```
### Define registerDevice method.
When the instance gets the callback, your application must post this data to your application server.
When your application receives the request, the application sever must use the server side sdk's create device api.
```
    // Define register device.
    sdkDelegate.registerDevice = function( apiParams ) {
      // YOUR CODE HERE.
    };
```

### Define flowComplete method.
```
    //Define flowComplete
    sdkDelegate.flowComplete = (ostWorkflowContext , ostContextEntity ) => {
      console.log("setupDeviceWorkflow :: sdkDelegate.flowComplete called");
      // Other things your application might want to do.
    };
```

### Define flowInterupt method.
```
    //Define flowInterrupt
    sdkDelegate.flowInterrupt = (ostWorkflowContext , ostError) => {
      console.log("setupDeviceWorkflow :: sdkDelegate.flowInterrupt called");
      // Your application may want to disable wallet related functionality here.
    };
```

### Invoke the workflow
To invoke the workflow you will need two things:
- `ost_user_id` - User Id of the logged-in user. 
- `token_id`- Token Id of your brand token economy.

```
let ost_user_id = "LOGGED_IN USER'S OST-USER-ID";
let token_id = "YOUR ECONOMY'S Id";
OstWalletSdk.setupDevice(ost_user_id, token_id, sdkDelegate);
```

## Create Session Workflow

A session is a period of time during which a sessionKey is authorized to sign transactions under a pre-set limit per transaction on behalf of the user. Follow the these steps to perform create session workflow.

### Create an object of create session workflow delegate.
```
    let sdkDelegate =  new OstWorkflowDelegate();
```

### Define requestAcknowledged method.

```
    //Define requestAcknowledged
    sdkDelegate.requestAcknowledged = (ostWorkflowContext , ostContextEntity) => {
      console.log("createSessionWorkflow :: sdkDelegate.requestAcknowledged called");
      //  Main communication between the wallet SDK and Ost Platform server is complete.
    };
```

### Define flowComplete method.
```
    //Define flowComplete
    sdkDelegate.flowComplete = (ostWorkflowContext , ostContextEntity ) => {
      console.log("createSessionWorkflow :: sdkDelegate.flowComplete called");
      // Other things your application might want to do like executing transaction
    };
```

### Define flowInterupt method.
```
    //Define flowInterrupt
    sdkDelegate.flowInterrupt = (ostWorkflowContext , ostError) => {
      console.log("createSessionWorkflow :: sdkDelegate.flowInterrupt called");
      // Session creation failed
    };
```

### Invoke the workflow
To invoke the workflow you will need three things:
- `ost_user_id` - User Id of the logged-in user. 
- `expiryTime`- session key expiry time.
- `spendingLimit`- higher unit spending limit once in a transaction of session.

Higher units conversion to Lower units is seen as the decimals specified for that token economy.
If value of decimals is 6 then the conversion would be 1 Higher Unit = 1000000 Lower units.

```
let ost_user_id = "LOGGED_IN USER'S OST-USER-ID";
let expiryTime = CURRENT_TIME + DAYS_SPECIFIED_BY_USER;
let spendingLimit = SPENDING_LIMIT_IN_HIGHER_UNIT;
OstWalletSdk.setupDevice(ost_user_id, expiryTime, spendingLimit ,sdkDelegate);
```



