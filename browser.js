//make sure angular script tag goes before your bundle!

var functions = [
  //"copy"
  , "extend"
  , "equals"
  , "forEach"
  , "noop"
  , "bind"
  //, "toJson"
  , "fromJson"
  , "identity"
  , "isUndefined"
  , "isDefined"
  , "isString"
  , "isFunction"
  , "isObject"
  , "isNumber"
  , "isElement"
  , "isArray"
  , "isDate"
  , "lowercase"
  , "uppercase"
];

module.exports = {};

functions.forEach(function(key){
  module.exports[key] = angular[key];
});