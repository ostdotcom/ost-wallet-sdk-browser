require('./utils.js');
const AWS = require('aws-sdk');
const awsUploader = require("./awsUploader");

class Deployer {
  constructor( config, awsCredentials ) {
    this.config = config;
    this.AWSS3 = new AWS.S3( awsCredentials );
    const allUploadConfigs = [
      this.config.km,
      this.config.sdk,
      this.config.js
    ];

    this.allUploadConfigs = allUploadConfigs.concat(this.config.mappyClients);
  }

  perform() {
    let len = this.allUploadConfigs.length;
    let promiseObj = Promise.resolve();
    for( let cnt = 0; cnt < len; cnt++ ) {
      promiseObj = this.chainUpload(promiseObj, this.allUploadConfigs[cnt] );
    }
    return promiseObj;
  }

  chainUpload( promiseObj, config ) {
    console.log("chainUpload config.bucket", config.bucket);
    return promiseObj.then(() => {
      return awsUploader(this.AWSS3, config ).then(() => {
        console.log("upload complete for ", config.bucket);
      });
    })
  }
}

module.exports = Deployer;