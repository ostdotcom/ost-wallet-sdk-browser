# Client Side Ost Wallet Browser Sdk

## Introduction
OST Wallet SDK Browser is a web application development SDK that enables developers to integrate the functionality of a non-custodial crypto-wallet into consumer applications. The sdk creates user's Api and session keys. Altough the device keys are created, they are not stored in the browser. Users must use your mobile application to authorize the session keys and perform transactions.


# Table of Contents

- [Client Side Ost Wallet Browser Sdk](#client-side-ost-wallet-browser-sdk)
  * [Introduction](#introduction)
- [Table of Contents](#table-of-contents)
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
More more information please refer [Setup And Initialization](./documentation/sdk_initialization.md) guide.


## Import OstWalletSdk
```
import OstWalletSdk from '@ostdotcom/ost-wallet-sdk-browser'
```


## Initialize the Sdk and setup user's device.
Use the below code to initialize the sdk and setup user's device.
The below code defines `initializeAndSetupOstSdk` method that you could use once your applications' page has loaded or before user's first wallet interaction by calling the `initializeAndSetupOstSdk` method.
The `initializeAndSetupOstSdk` return a `Promise` that only resolves when both the tasks are completed without any errors.

**Note:** <u>Your code needs to <b>invoke or call</b></u> the `initializeAndSetupOstSdk` method.

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


    return return OstWalletSdk.init( sdkConfig )
        .then(() => {
          return oThis.setupDeviceWorkflow();
        })
  }
```





# Detailed Documentaion Refrence
  * [Setup & Initialization](./documentation/sdk_initialization.md)
  * [Workflows](./documentation/workflows.md)
  * [OstJsonApi](./documentation/OstJsonApi.md)
  * [Other Methods](./documentation/sdk_getters.md)
  * [Setup Development Environemnt](./documentation/development_environment_setup.md)
