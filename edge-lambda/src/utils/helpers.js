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

exports.addCSPPart = ( part, cspPartsArray ) => {
  let cleanedPart = String( part ).trimRight(";");
  cleanedPart = cleanedPart.toLowerCase();
  cspPartsArray.push( cleanedPart );
};