
require('./utils.js');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const listFiles = (folderPath) => {
  let _resolve, _reject;
  folderPath = folderPath.trimRight("/");
  glob(folderPath + "/**/*", {nodir: true}, function(err, fileList) {
    if ( err ) {
      _reject(err);
      return;
    }
    _resolve(fileList)
  })

  return new Promise((res, rej) => {
    _resolve = res;
    _reject  = rej;
  })
}

const readFile = (filePath) => {
  let _resolve, _reject;

  fs.readFile(filePath, function (err, data) {
    if ( err ) {
      console.log("Error reading", filePath);
      _reject( err );
      return;
    }
    _resolve( data );
  });

  return new Promise((resolve, reject) => {
    _resolve = resolve;
    _reject  = reject;
  })
}

const getContentType = ( filePath ) => {
  if ( filePath.endsWith('.html') ) {
    return 'text/html';
  }
  if ( filePath.endsWith('.js') ) {
    return 'application/javascript';
  }
  if ( filePath.endsWith('.json') ) {
    return 'application/json'
  }
  return 'application/*';
}

const uploadFile = (AWSS3, filePath, config) => {
  let _resolve, _reject;
  let uploadOptions = config.uploadOptions || {};
  // Shallow copy.
  uploadOptions = {
    ...uploadOptions
  };

  let sourceFolder = config.sourceFolder;
  let bucket = config.bucket.trimRight("/");
  let s3Path = config.s3Path;
  let lockPeriodInYears = 1; 
  let lockUntilDate = new Date();
  lockUntilDate.setFullYear(lockUntilDate.getFullYear() + 1);

  s3Path = s3Path.trimLeft("/");
  s3Path = s3Path.trimRight("/");
  s3Path = s3Path.replace('v-rac-9', 'v-rac-1');

  let Bucket = bucket;
  let Key = s3Path + filePath.replace(sourceFolder, "");

  readFile(filePath)
    .then((fileData) => {
      let fixedParams = {
        Bucket: bucket, 
        Key: Key, 
        Body: fileData,
        ACL: 'public-read',
        ContentType: getContentType( filePath )
        // ObjectLockMode: "COMPLIANCE",
        // ObjectLockRetainUntilDate: lockUntilDate
      };

      let uploadParams = {
        ...uploadOptions,
        ...fixedParams
      }
      return AWSS3.upload(uploadParams)
        .promise()
        .then(function(resp) {
          console.log(`Uploaded ${Bucket}/${Key}`);
          _resolve();    
        }).catch((err) => {
          console.error(`Failed to upload ${Bucket}/${Key}`);
          throw err;
        })
      
    }).catch((err) => {
      _reject(err);
    })



  return new Promise((resolve, reject) => {
    _resolve = resolve;
    _reject  = reject;
  })
}


module.exports = async (AWSS3, config) => {
  let sourceFolder = config.sourceFolder;
  let fileList = await listFiles(sourceFolder);
  let len = fileList.length;
  let allPromises = [];
  while( len-- ) {
    let p = uploadFile(AWSS3, fileList[ len ], config );
    allPromises.push( p );
  }

  return Promise.all( allPromises );
}