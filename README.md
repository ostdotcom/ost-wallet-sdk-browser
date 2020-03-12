# Client Side Ost Wallet Browser Sdk

## Introduction
OST Wallet SDK Browser is a web application development SDK that enables developers to integrate the functionality of a non-custodial crypto-wallet into consumer applications. The sdk creates user's Api and session keys. Altough the device keys are created, they are not stored in the browser. Users must use your mobile application to authorize the session keys and perform transactions.


# Table of Contents

- [Quick start guide](#quick-start-guide)
  * [Installation](#installation)
  * [Import OstWalletSdk](#import-ostwalletsdk)
  * [Initialize the Sdk and setup user's device.](#initialize-the-sdk-and-setup-user-s-device)
- [Documentation](#)
  * [Setup & Initialization](./documentation/sdk_initialization.md)
  * [Workflows](./documentation/workflows.md)
  * [OstJsonApi](./documentation/ost_json_api.md)
  * [Useful Methods](./documentation/useful_methods.md)
  * [Setup Development Environemnt](./documentation/development_environment_setup.md)


# Quick start guide

## Installation

Install the npm module
```
npm install @ostdotcom/ost-wallet-sdk-browser --save
```
For more information please refer [Setup And Initialization](./documentation/sdk_initialization.md) guide.


## Import OstWalletSdk
```
import OstWalletSdk from '@ostdotcom/ost-wallet-sdk-browser'
```


## Initialize the Sdk and setup user's device.
Use the below code to initialize the sdk and setup user's device.
The below code defines `initializeAndSetupOstSdk` method that you could use once your applications' page has loaded or before user's first wallet interaction by calling the `initializeAndSetupOstSdk` method.
The `initializeAndSetupOstSdk` return a `Promise` that only resolves when both(initialize and setup) the tasks are completed without any errors.

> The below example is a code template. <b>Copy and pasting it will NOT work.</b>
> <br />You need to change `YOUR_TOKEN_ID` and write code inside `registerDevice` method and <b>invoke or call</b> the `initializeAndSetupOstSdk` method defined below.


```js
  /* Deifne the sdk config */
  const sdkConfig = {
    token_id: "YOUR_TOKEN_ID",
    environment: "testnet",
    create_session_qr_timeout: 3 * 60 *60,
    max_workflow_count: 50
  };
```
For more information regarding configuration please refer [Setup And Initialization](./documentation/sdk_initialization.md) guide.

```js
  /*
      Define a method initializeAndSetupOstSdk to combine init sdk method and setupdevice workflow.
   */

  /**
   * initializeAndSetupOstSdk - initializes the sdk and then performs setup device workflow for the logged-in user.
   * @param  {String} ost_user_id Ost User Id of the logged-in user.
   * @param  {String} token_id    Token-Id of the your brand token economy.
   * @return {Promise}            a Promise that only resolves when both the tasks are completed without any failuers.
   */
  const initializeAndSetupOstSdk = (ost_user_id, token_id) => {
    const registerDevice(apiParams) { 
      /**
       * Write your code here to send the api params to your server.
       * Use the server side sdk to register the device.
       */

    }

    const setupDeviceWorkflow = () => {
      let sdkDelegate =  new OstSetupDeviceDelegate();
      // Define register device.
      sdkDelegate.registerDevice = function( apiParams ) {
        console.log(LOG_TAG, "registerDevice");
        return registerDevice(apiParams);
      };

      //Define flowComplete
      sdkDelegate.flowComplete = (ostWorkflowContext , ostContextEntity ) => {
        console.log("setupDeviceWorkflow :: sdkDelegate.flowComplete called");
        
        _resolve( ostContextEntity );
      };

      //Define flowInterrupt
      sdkDelegate.flowInterrupt = (ostWorkflowContext , ostError) => {
        console.log("setupDeviceWorkflow :: sdkDelegate.flowInterrupt called");
        _reject( ostError );
      };

      // Return a promise that invokes the workflow.
      return new Promise( (res, rej) => {
        _resolve = res;
        _reject  = rej;

        // Invoke the workflow.
        OstWalletSdk.setupDevice(ost_user_id, token_id, sdkDelegate);
      });
    };
    
  return OstWalletSdk.init( sdkConfig )
        .then(() => {
          return oThis.setupDeviceWorkflow();
        })
  }
```

## Subscribe to workflow events
> The below example is a code template. Please wirte code inside the functions as per your application's need.

```js
OstWalletSdk.subscribeAll("flowInitiated", (workflowContext) => {
   consloe.log("workflowContext : ", workflowContext);
});

OstWalletSdk.subscribeAll("requestAcknowledged", (workflowContext, contextEntity) => {
   consloe.log("workflowContext : ", workflowContext);
   consloe.log("contextEntity : ", contextEntity);

   /* TODO: Update your server if needed. */   
});

OstWalletSdk.subscribeAll("flowCompleted", (workflowContext, contextEntity) => {
   consloe.log("workflowContext : ", workflowContext);
   consloe.log("contextEntity : ", contextEntity);

  /* TODO: Show success to the user. */   
});

OstWalletSdk.subscribeAll("flowInterrupted", (workflowContext, ostError) => {
  consloe.log("workflowContext : ", workflowContext);
  consloe.log("ostError : ", ostError);

  /* TODO: Show errors to the user. */
      
});
```

## Create session key
> The below example is a code template. <b>Copy and pasting it will NOT work.</b>
> <br />You need to change `LOGGED_IN_USERS_OST_USER_ID` and show the QR code to the user.

```js
  let ost_user_id = "LOGGED_IN_USERS_OST_USER_ID";
  let sdkDelegate =  new OstWorkflowDelegate();

  //Define requestAcknowledged
  sdkDelegate.requestAcknowledged = (ostWorkflowContext , ostContextEntity) => {
    console.log("createSessionWorkflow :: sdkDelegate.requestAcknowledged called");
    /* TODO: Show the QR code to the user. */
  };
  
  /* Set session expiry to 7 days from now. */
  let expiryTime = parseInt(Date.now()/1000) + (7 * 24 * 60 * 60);

  /* Set spedning limit as 100 BTs */
  let spendingLimit = 100; 

  //Invoke the workflow.
  OstWalletSdk.createSession(ost_user_id, expiryTime, spendingLimit ,sdkDelegate);
```
For more information please refer [Create Session Workflow](./documentation/workflows.md#create-session-workflow)

## Perform Transactions
> The below example is a code template. <b>Copy and pasting it will NOT work.</b>
> <br />The below code uses [bignumber.js](https://github.com/MikeMcl/bignumber.js/) library. Make sure to install it.
> <br />You need to change `LOGGED_IN_USERS_OST_USER_ID`, `RECEPIENTS_TOKENHOLDER_ADDRESS` and set `BT_DECIMALS`.

### convertBtToLowerUnit Helper method
This helper method can be used to easily convert amount from higher unit (such as `Eth`) into lower unit (such as `Wei`).
```js
  import BigNumber from 'bignumber.js';

  let BT_DECIMALS = 18; /* TODO: Set it to your token's decimal */
  /* If you do not know your token's decimal, Use below code  */ 
  //  OstWalletSdk.getToken(tokenId)
  //    .then((token) => {
  //      console.log("My token's deciaml is", token.decimals);
  //    });

  const convertBtToLowerUnit = (amount) => {
    const decimals = BT_DECIMALS;
    const decimalBN = new BigNumber(decimals);
    const multiplier = new BigNumber(10).pow(decimalBN);
    const amountBN = new BigNumber(amount);
    const amountInLowerUnit = amountBN.multipliedBy(multiplier);
    return amountInLowerUnit.toString(10);
  };
```

### Execute Direct Transfer
```js
  let sdkDelegate = new OstWorkflowDelegate();
  let ost_user_id = "LOGGED_IN_USERS_OST_USER_ID";
  let token_holder_address = "RECEPIENTS_TOKENHOLDER_ADDRESS";
  let amountInLowerUnit = convertBtToLowerUnit(1); /* 1 Bt. */
  OstWalletSdk.executeDirectTransferTransaction(ost_user_id, {
    token_holder_addresses : [token_holder_address],
    amounts: [amountInLowerUnit] 
  },
  sdkDelegate);
```
For more information please refer [Execute Transaction Workflow](./documentation/workflows.md#execute-transaction-workflow)


# Detailed Documentaion Refrence
  * [Setup and Initialization](./documentation/sdk_initialization.md)
  * [Workflows](./documentation/workflows.md)
  * [OstJsonApi](./documentation/ost_json_api.md)
  * [Other Methods](./documentation/useful_methods.md)
  * [Setup Development Environemnt](./documentation/development_environment_setup.md)
