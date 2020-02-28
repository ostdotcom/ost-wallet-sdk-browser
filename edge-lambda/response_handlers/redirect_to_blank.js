const config = require("../config.json");
const errorLogger = require("../utils/error_logger");
const redirectPath = config.REDIRECT_URL;
const bodyContent = `<script type="text/javascript">window.location="${redirectPath}"</script>`;

const LOG_TAG = "BSL_RTB";
const ALARM_LOG_TAG = config.ALARM_LOG_TAG;

module.exports = (callback) => {
  
  
  const response = {
    headers: {
        'content-type': [{key:'Content-Type', value: 'text/html; charset=utf-8'}]
     },
    body: bodyContent,
    status: '200',
    statusDescription: "OK"
  };

  try {
    const zlib = require('zlib');
    const buffer = zlib.gzipSync(bodyContent);
    const base64EncodedBody = buffer.toString('base64');
    response.body = base64EncodedBody;
    response.bodyEncoding = 'base64';
    headers['content-encoding'] = [{key:'Content-Encoding', value: 'gzip'}];

  } catch(error) {
    errorLogger(LOG_TAG, "could not gzip response.", error);
  }

  // Invoke the callback.
  callback(null, response);
};