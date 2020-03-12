require('./utils.js');
const Deployer = require("./Deployer");
const Path = require("path");

//TODO: Remove these hard coding.
const CC_MAX_AGE='max-age=300';
const SDK_BUCKET="wallet-sdk.stagingpepocoin.com";
const KM_BUCKET = "wallet-km.stagingpepocoin.com";
const MAPPY_BUCKET = "mappy-client.stagingost.com";


const exitWithError = (...args) => {
  console.log("!----------------- Deployment Failed -----------------!");
  console.log("!----------------- Attention Needed! -----------------!");
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.error(...args);
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  process.exit(1);
};

const validateEnvironmentVariables = () => {
  const envVarlist = {
    "TOKEN_IDS": 'Comma seperated list of tokenIds. No white-spaces. E.g. "1129,1271"',
    "OST_BROWSER_SDK_VERSION": 'Version of the sdk. Free text. No sapce allowed. E.g. "v-1.0.0" or "v-dev-1"',
    "OST_BROWSER_SDK_AWS_ACCESS_TOKEN": 'AWS access token to be used to upload files to S3',
    "OST_BROWSER_SDK_AWS_SECRET": 'AWS secret key to be used to upload files to S3',
    "OST_BROWSER_SDK_S3_REGION": 'AWS S3 region'
  };
  const tokenEnvVarList = {
    "DEMO_MAPPY_UI_S3_PATH_[TOKEN_ID]": "Folder or path in which mappy files are to be uploaded. Not to be confused with bucket."
  };

  let invalidVarMessages = ["\n<br/> Missing Enviroment Variable(s):"];
  let isValid = true;
  for( let envVar in envVarlist ) {
    if ( !process.env[ envVar ] ) {
      invalidVarMessages.push( "\n<br />\t" + envVar + " : " + envVarlist[envVar] );
      isValid = false;
    }
  }

  invalidVarMessages.push("\n<br/> Token Specific Enviroment Variable(s):");
  if ( !process.env.TOKEN_IDS ) {
    for( let envVar in tokenEnvVarList ) {
      invalidVarMessages.push( "\n<br />\t\t" + envVar + " : " + tokenEnvVarList[envVar] );
    }
    exitWithError.call(null, ...invalidVarMessages);
  }

  // Validate token specific environment variables.
  const tokenIds = process.env.TOKEN_IDS.split(",");
  let len = tokenIds.length;
  for( let cnt = 0; cnt < len; cnt++ ) {
    let thisTokenId = tokenIds[ cnt ];
    for( let envVar in tokenEnvVarList ) { 
      let tokenEnvVar = envVar.replace('[TOKEN_ID]', thisTokenId);
      if ( !process.env[ tokenEnvVar ] ) {
        invalidVarMessages.push( "\n<br />\t\t" + tokenEnvVar + " : " + tokenEnvVarList[envVar] );
        isValid = false;
      }
    }
  }

  if ( !isValid ) {
    exitWithError.call(null, ...invalidVarMessages);
  }
}

const buildMappyClientConfigs = ( SOURCE_FOLDER ) => {
  const mappyClientConfig = [];
  const sdkVersion = process.env.OST_BROWSER_SDK_VERSION;

  const tokenIds = process.env.TOKEN_IDS.split(",");
  let len = tokenIds.length;
  for( let cnt = 0; cnt < len; cnt++ ) {
    let thisTokenId = tokenIds[ cnt ];

    let s3Path = process.env[ "DEMO_MAPPY_UI_S3_PATH_" + thisTokenId ];
    s3Path = s3Path.trimRight("/") + `/${sdkVersion}/`;


    mappyClientConfig.push({
      "sourceFolder": `${SOURCE_FOLDER}/mappy-${thisTokenId}`,
      "bucket": MAPPY_BUCKET,
      "s3Path": s3Path,
      "uploadOptions": {
        "CacheControl": `${CC_MAX_AGE}`,
      }
    });
  }

  return mappyClientConfig;
};


const main = () => {
  validateEnvironmentVariables();

  const sdkVersion = process.env.OST_BROWSER_SDK_VERSION;
  const SOURCE_FOLDER = Path.resolve(__dirname, `../dist/${sdkVersion}/`);


  let config = {
    "buildLocation": Path.resolve(`../dist/${sdkVersion}/`),
    "version": sdkVersion,
    

    "js": {
      "sourceFolder": `${SOURCE_FOLDER}/ost-sdk-scripts`,
      "bucket": "wallet.stagingpepocoin.com",
      "s3Path": `/${sdkVersion}/`,
      "uploadOptions": {
        "CacheControl": `${CC_MAX_AGE}`,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD",
        "Access-Control-Max-Age": "3000"
      }
    },

    // Bucket where sdk's index.html needs to be uploaded.
    "sdk": {
      "sourceFolder": `${SOURCE_FOLDER}/ost-sdk`,
      "bucket": SDK_BUCKET,
      "s3Path": `/${sdkVersion}/`,
      "uploadOptions": {
        "CacheControl": `${CC_MAX_AGE}`
      }
    },
    
    "km": {
      "sourceFolder": `${SOURCE_FOLDER}/ost-sdk-key-manager`,
      "bucket": KM_BUCKET,
      "s3Path": `/${sdkVersion}/`,
      "uploadOptions": {
        "CacheControl": `${CC_MAX_AGE}`
      }
    },

    "mappyClients": buildMappyClientConfigs( SOURCE_FOLDER )
  };

  console.log("config", JSON.stringify(config));

  let awsCredentials = {    
    "accessKeyId": process.env.OST_BROWSER_SDK_AWS_ACCESS_TOKEN,
    "secretAccessKey": process.env.OST_BROWSER_SDK_AWS_SECRET,
    "region": process.env.OST_BROWSER_SDK_S3_REGION
  };

  return new Deployer(config, awsCredentials).perform()
    .catch(( err ) => {
      exitWithError( err );
    })
};


main();
