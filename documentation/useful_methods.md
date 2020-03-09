# OST Wallet SDK

### Get Current Device
API to get information about user's current device.

##### Usage
```
/*
  Please update userId as per your needs. 
  Since this userId does not belong to your economy, you will get an error if you do not change it.
*/

/**
  getCurrentDevice() return a promise. Promise return response in .then() and .catch() returns the error, if any occurred.
*/

let userId = 'dabd272f-b330-4c99-a3f7-aaf38012ef5f';
OstWalletSdk.getDevice( userId )
  .then( (result) => {
    console.log( result ); 
  })
  .catch( ( error ) => { 
    console.log( error ); 
  });

```
##### Sample Response
```json
{
  "user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
  "address": "0xd1d2773b372dc1be0131c3313c9ae77b0619a08f",
  "linked_address": null,
  "api_signer_address": "0x39d63831ef5f2949d607f069c97eac9fff72ecd9",
  "status": "REGISTERED",
  "updated_timestamp": 1581934429,
  "id": "0xd1d2773b372dc1be0131c3313c9ae77b0619a08f"
}
```

### Get User
API to get information about current user.
##### Usage
```
/*
  Please update userId as per your needs. 
  Since this userId does not belong to your economy, you will get an error if you do not change it.
*/

/**
  getUser() return a promise. Promise return response in .then() and .catch() returns the error, if any occurred.
*/

let userId = 'dabd272f-b330-4c99-a3f7-aaf38012ef5f';
OstWalletSdk.getUser( userId )
  .then( (result) => {
    console.log( result ); 
  })
  .catch( ( error ) => { 
    console.log( error ); 
  });

```
##### Sample Response
```json
{
  "id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
  "token_id": 1129,
  "token_holder_address": "0x3677e3e20f389332a4855c44260767eca55a5599",
  "device_manager_address": "0xb2b29acf564647d1d924b0f06b9539d0c65cc34a",
  "recovery_address": "0xb94768e6373d05454e828d5128e9f37120d26722",
  "recovery_owner_address": "0x674e0525c6023dda7d57d35c07cb59c9a73091f4",
  "type": "user",
  "status": "ACTIVATED",
  "updated_timestamp": 1582036771
}
```

### Get Token
It takes current users tokenId as parameter and returns token information.
##### Usage
```
/*
  Please update tokenId as per current user's token id.
*/

/**
  getToken() return a promise. Promise return response in .then() and .catch() returns the error, if any unexpected error occurs.
*/

let tokenId = currentUser.token_id;
OstWalletSdk.getToken( tokenId )
  .then( (result) => {
    console.log( result ); 
  })
  .catch( ( error ) => { 
    console.log( error ); 
  });

```
##### Sample Response
```json
{
  "id": 1129,
  "name": "STC1",
  "symbol": "SC1",
  "base_token": "USDC",
  "conversion_factor": 10,
  "total_supply": "1000000000000",
  "decimals": 6,
  "origin_chain": {
    "chain_id": 3,
    "branded_token": "0x18cbeae2f1785abf68c9984f9186a29ed062c3ca",
    "organization": {
      "contract": "0x0260a404804b1d7cf6fa678fb5d8441495cfff1b",
      "owner": "0x8986922410e5d8cf43cfc94c1b51dcf8dfdf7637"
    },
    "stakers": [
      
    ]
  },
  "auxiliary_chains": [
    {
      "chain_id": 197,
      "utility_branded_token": "0xc50e3fd492a9a99a964f7aff8d755075d0732ff0",
      "company_token_holders": [
        "0x93f08d0c5d7bc28cc117681b3b23f8501a09e786"
      ],
      "company_uuids": [
        "d6bf0061-a32d-48af-a29b-013260a947f3"
      ],
      "organization": {
        "contract": "0xb8e3fcfb5dac714e40b63489f4f393c7073fdbb3",
        "owner": "0x8986922410e5d8cf43cfc94c1b51dcf8dfdf7637"
      }
    }
  ],
  "updated_timestamp": 1560167796
  } "updated_timestamp": 1582036771
```

### Get Active Sessions
API returns current active sessions of the user.
##### Usage
```
/*
  Please update userId as per your needs. 
  Since this userId does not belong to your economy, you will get an error if you do not change it.
*/

/**
  getActiveSessions() return a promise. Promise return response in .then() and .catch() returns the error, if any occurred.
*/

let userId = 'dabd272f-b330-4c99-a3f7-aaf38012ef5f';
OstWalletSdk.getActiveSessions( userId )
  .then( (result) => {
    console.log( result ); 
  })
  .catch( ( error ) => { 
    console.log( error ); 
  });

```
##### Sample Response
```json
[
  {
    "user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
    "address": "0x2e0ade9d1fc635fc99794922200fc55cbd9317ba",
    "expiration_height": 8259455,
    "approx_expiration_timestamp": 1582109476,
    "spending_limit": "100000000000000000",
    "nonce": 18,
    "status": "AUTHORIZED",
    "updated_timestamp": 1582019562,
    "id": "0x2e0ade9d1fc635fc99794922200fc55cbd9317ba"
  },
  {
    "user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
    "address": "0x3d7a80caf77d96e681ac4e60842d600af5dcb7ed",
    "expiration_height": 8233005,
    "approx_expiration_timestamp": 1582030124,
    "spending_limit": "1000000000000000",
    "nonce": 13,
    "status": "AUTHORIZED",
    "updated_timestamp": 1581940131,
    "id": "0x3d7a80caf77d96e681ac4e60842d600af5dcb7ed"
  },
  {
    "user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
    "address": "0x59395ffcae8d2ee7dafc96dbc8939b45367c0a94",
    "expiration_height": 8233022,
    "approx_expiration_timestamp": 1582030175,
    "spending_limit": "1000000000000000",
    "nonce": 0,
    "status": "AUTHORIZED",
    "updated_timestamp": 1581940189,
    "id": "0x59395ffcae8d2ee7dafc96dbc8939b45367c0a94"
  },
  {
    "user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
    "address": "0x993f1f4710bdb59360c6b6ae3c5b87ec92fa8211",
    "expiration_height": 8233059,
    "approx_expiration_timestamp": 1582030286,
    "spending_limit": "1000000000000000",
    "nonce": 0,
    "status": "AUTHORIZED",
    "updated_timestamp": 1581940299,
    "id": "0x993f1f4710bdb59360c6b6ae3c5b87ec92fa8211"
  }
]
```

### Get Workflow Info
API returns workflow info for given workflow id and user id.
##### Usage
```
/*
  Please update userId, workflowId as per your needs. 
  Since this userId does not belong to your economy, you will get an error if you do not change it.
*/

/**
  getWorkflowInfo() return a promise. Promise return response in .then() and .catch() returns the error, if any occurred.
*/

let userId = 'dabd272f-b330-4c99-a3f7-aaf38012ef5f';
let workflowId = 'b68e0278-d014-49d6-be41-33d66ccf7e82';
OstWalletSdk.getWorkflowInfo(userId, workflowId)
  .then( (result) => { 
      console.log( result ); 
  })
  .catch( (err) => { 
      console.log(err); 
  });

```
##### Sample Response
```json
{ 
  "name": "SETUP_DEVICE", 
  "id": "b68e0278-d014-49d6-be41-33d66ccf7e82", 
  "user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f", 
  "status": "COMPLETED", 
  "args": [ 
            { 
              "user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f", 
              "token_id": 1129, 
              "workflow_id": "b68e0278-d014-49d6-be41-33d66ccf7e82", 
              "subscriber_id": "b68e0278-d014-49d6-be41-33d66ccf7e82"
            } 
          ], 
  "created_at": 1583495779,
  "updated_at": 1583495779 
}
```

### Get Pending workflows
API returns pending workflows for user id.
##### Usage
```
/*
  Please update userId as per your needs. 
  Since this userId does not belong to your economy, you will get an error if you do not change it.
*/

/**
  getPendingWorkflows() return a promise. Promise return response in .then() and .catch() returns the error, if any occurred.
*/

let userId = 'dabd272f-b330-4c99-a3f7-aaf38012ef5f';
OstWalletSdk.getPendingWorkflows(userId)
  .then( (result) => { 
      console.log( result ); 
  })
  .catch( (err) => { 
      console.log(err); 
  });

```
##### Sample Response
```json
[ 
  { 
    "name": "CREATE_SESSION", 
    "id": "15b050a7-eee7-4d58-b574-bdf0e735615b", 
    "user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f", 
    "status": "ACKNOWLEDGED", 
    "args": [ 
              { 
                "user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
                "spending_limit": "1", 
                "expiration_time": 1583582172,
                "workflow_id": "15b050a7-eee7-4d58-b574-bdf0e735615b", 
                "subscriber_id": "15b050a7-eee7-4d58-b574-bdf0e735615b" 
              }
            ], 
    "context_entity_id": "0x6BfaBA7d6C7fF30a21eE18c59814bB6C8ab1F77b",
    "context_entity_type": "session", 
    "created_at": 1583495773, 
    "updated_at": 1583495774 
  }
]
```
