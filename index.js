(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([ "module", "lodash" ], function (module, lodash) {
      module.exports = factory(lodash);
    });
  } else if (typeof module === "object") {
    module.exports = factory(require("lodash"));
  } else {
    root.ngUtils = factory(root._);
  }
}(this, function (_) {
  var lodashMap = {
      //"copy"
      "extend"      : "extendOwn"
    , "equals"      : "isEqual"
    , "forEach"     : "forEach"
    , "noop"        : "noop"
    //, "toJson"      : null
    , "identity"    : "identity"
    , "isUndefined" : "isUndefined"
    , "isString"    : "isString"
    , "isFunction"  : "isFunction"
    , "isObject"    : "isObject"
    , "isNumber"    : "isNumber"
    , "isElement"   : "isElement"
    , "isArray"     : "isArray"
    , "isDate"      : "isDate"
  };

  var exports = {
    // angular and lodash flip the first two args
    bind: function bind(self, fn, var_args){
      var args = Array.prototype.slice.call(arguments);
      args[0] = fn;
      args[1] = self;
      _.bind.apply(null,args);
    },
    fromJson: function fromJson(json){
      return exports.isString(json)
        ? JSON.parse(json)
        : json;
    },
    isDefined: function isDefined(value){
      return typeof value !== 'undefined';
    },
    isObject: function isObject(value){
      return value !== null && typeof value === 'object';
    },
    lowercase: function (string) {
      return exports.isString(string) ? string.toLowerCase() : string;
    },
    uppercase: function (string) {
      return exports.isString(string) ? string.toUpperCase() : string;
    }
  };

  _.forEach(lodashMap,function(lodashKey, angularKey){
    exports[angularKey] = _[lodashKey];
  });

  return exports;
}));
