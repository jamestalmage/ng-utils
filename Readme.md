ng-utils
========

CommonJS wrapper for angular.js helper functions.
In the browser, it uses angular.
On the server, most functions fall back to lodash equivalents.
Allows you to target *some* of your angular code to run server side as well.
(Just keep any DOM manipulation, etc from leaking into your module).

List of implemented functions.

* `angular.extend`
* `angular.equals`
* `angular.forEach`
* `angular.noop`
* `angular.bind`
* `angular.fromJson`
* `angular.identity`
* `angular.isUndefined`
* `angular.isDefined`
* `angular.isString`
* `angular.isFunction`
* `angular.isObject`
* `angular.isNumber`
* `angular.isElement`
* `angular.isArray`
* `angular.isDate`
* `angular.lowercase`
* `angular.uppercase`

Not implemented (PR's welcome):
* `angular.copy`
* `angular.toJson`