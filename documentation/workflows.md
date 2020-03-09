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
let workflowId = OstWalletSdk.setupDevice(ost_user_id, token_id, sdkDelegate);

/// use workflowId to subscribe to events.
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
let workflowId = OstWalletSdk.createSession(ost_user_id, expiryTime, spendingLimit ,sdkDelegate);

/// use workflowId to subscribe to events.
```

## Execute Transaction Workflow

A transaction where tokens are transferred from a user to another actor within are signed using sessionKey if there is an active session. In the absence of an active session, a new session is authorized. Follow the these steps to perform Execute Transaction workflow.

### Create an object of create session workflow delegate
```
    let sdkDelegate =  new OstWorkflowDelegate();
```
### Define requestAcknowledged method

```
  //Define requestAcknowledged
  sdkDelegate.requestAcknowledged = function(ostWorkflowContext, ostContextEntity) {
    console.log("ExecuteTransactionWorkflow :: sdkDelegate.requestAcknowledged called");
    //  Main communication between the wallet SDK and Ost Platform server is complete.
  };
```

### Define flowComplete method
```
    //Define flowComplete
    sdkDelegate.flowComplete = (ostWorkflowContext , ostContextEntity ) => {
      console.log("ExecuteTransactionWorkflow :: sdkDelegate.flowComplete called");
      // Execute Transaction is successfully executed.
    };
```

### Define flowInterupt method
```
    //Define flowInterrupt
    sdkDelegate.flowInterrupt = (ostWorkflowContext , ostError) => {
      console.log("ExecuteTransactionWorkflow :: sdkDelegate.flowInterrupt called");
      // Execute Transaction failed.
    };
```

### Invoke the workflow
There are two types of method available for invoking execute transaction.
- Direct Transfer
- Execute Pay

#### Direct Transfer
It is direct token to token transfer.
To invoke the Direct Transfer you will need three things:
- 'ost_user_id' - User Id of the logged-in user. 
- 'token_holder_addresses' - Token Holder Address of the receiver.
- 'amounts' - Amount needed to be send.

```
let ost_user_id = "LOGGED_IN USER'S OST-USER-ID";
let token_holder_address = "TOKEN HOLDER ADDRESS OF RECEIVER";
let amount = "CONVERTED USER ENTERED TOKEN AMOUNT TO WEI ";

let workflowId = OstWalletSdk.executeDirectTransferTransaction(user_id, {
                    token_holder_addresses : [token_holder_address],
                    amounts: [amount] 
                  },
                  sdkDelegate);
                  
/// use workflowId to subscribe to events.
```

#### Execute Pay 
It accepts amount in cent and then internally converts it into token and send resultant amount to the receiver.
To invoke the Execute Pay you will need three things:
- 'ost_user_id' - User Id of the logged-in user. 
- 'token_holder_addresses' - Token Holder Address of the receiver.
- 'amounts' - Amount needed to be send.
- options parameter in which currency_code is passed. Currency_code determines currency type.

There are three currency type - 
- USD
- GBP
- EUR

```
let ost_user_id = "LOGGED_IN USER'S OST-USER-ID";
let token_holder_address = "TOKEN HOLDER ADDRESS OF RECEIVER";
let amount = "CONVERTED USER ENTERED CENT AMOUNT TO WEI ";
let currency_type = "CURRENCY CODE SELECTED BY USER";

let workflowId = OstWalletSdk.executePayTransaction(currentUser.user_id, {
                    token_holder_addresses: [tokenHolderAddress],
                    amounts: [amount],
                    options: {
                        currency_code: currency_type
                    }
                },
                sdkDelegate);
                
/// use workflowId to subscribe to events.
```

## Subscribe to workflow events
Subscription to workflow events can be performed in three ways:

#### Susbscribe by workflow Id
All event of particular workflow id can be delivered on subscribing it.
```javascript
 OstWalletSdk.subscribe("flowInitiated", workflowId, (workflowContext) => {
      consloe.log("workflowContext : ", workflowContext);
 });

 OstWalletSdk.subscribe("requestAcknowledged", workflowId, (workflowContext, contextEntity) => {
      consloe.log("workflowContext : ", workflowContext);
      consloe.log("contextEntity : ", contextEntity);
      
      //Perfrom action on requestAcknowledged
 });

 OstWalletSdk.subscribe("flowCompleted", workflowId, (workflowContext, contextEntity) => {
      consloe.log("workflowContext : ", workflowContext);
      consloe.log("contextEntity : ", contextEntity);
      
      //Perfrom action on flowCompleted
 });
 
 OstWalletSdk.subscribe("flowInterrupted", workflowId, (workflowContext, ostError) => {
      consloe.log("workflowContext : ", workflowContext);
      consloe.log("ostError : ", ostError);
      
      //Perfrom action on flowInterrupted
});
```

#### Susbscribe by user Id
To get all workflow events performed by user, subscribe to user id.
```javascript

let userId = <OST_USER_ID>
OstWalletSdk.subscribeAll("flowInitiated", (workflowContext) => {
   consloe.log("workflowContext : ", workflowContext);
   
   //Perfrom action on flowInitiated for user id 
}, userId);

OstWalletSdk.subscribeAll("requestAcknowledged", (workflowContext, contextEntity) => {
   consloe.log("workflowContext : ", workflowContext);
   consloe.log("contextEntity : ", contextEntity);
   
   //Perfrom action on requestAcknowledged for user id 
}, userId);

OstWalletSdk.subscribeAll("flowCompleted", (workflowContext, contextEntity) => {
   consloe.log("workflowContext : ", workflowContext);
   consloe.log("contextEntity : ", contextEntity);
   
   //Perfrom action on flowCompleted for user id  
}, userId);

OstWalletSdk.subscribeAll("flowInterrupted", (workflowContext, ostError) => {
  consloe.log("workflowContext : ", workflowContext);
  consloe.log("ostError : ", ostError);
      
  //Perfrom action on flowInterrupted for user id
}, userId);
```

#### Susbscribe to all workflow events
Developer can subscribe to all workflow event.

```js
OstWalletSdk.subscribeAll("flowInitiated", (workflowContext) => {
   consloe.log("workflowContext : ", workflowContext);
});

OstWalletSdk.subscribeAll("requestAcknowledged", (workflowContext, contextEntity) => {
   consloe.log("workflowContext : ", workflowContext);
   consloe.log("contextEntity : ", contextEntity);

});

OstWalletSdk.subscribeAll("flowCompleted", (workflowContext, contextEntity) => {
   consloe.log("workflowContext : ", workflowContext);
   consloe.log("contextEntity : ", contextEntity);
   
});

OstWalletSdk.subscribeAll("flowInterrupted", (workflowContext, ostError) => {
  consloe.log("workflowContext : ", workflowContext);
  consloe.log("ostError : ", ostError);
      
});
```
