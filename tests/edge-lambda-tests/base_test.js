const lambdaFunction = require("../../edge-lambda");
const lambdaContext = require("./responses/sample_context");
console.log("lambdaFunction", lambdaFunction);
module.exports = (reponseJson, callback) => {
  return lambdaFunction.handler(reponseJson, lambdaContext, callback);
};


String.prototype.trimRight = function(charlist) {
  if (charlist === undefined)
    charlist = "\s";

  return this.replace(new RegExp("[" + charlist + "]+$"), "");
};

String.prototype.trimLeft = function(charlist) {
  if (charlist === undefined)
    charlist = "\s";

  return this.replace(new RegExp("^[" + charlist + "]+"), "");
};