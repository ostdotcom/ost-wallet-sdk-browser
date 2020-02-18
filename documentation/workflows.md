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