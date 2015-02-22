module.exports = initTasks;
initTasks.version = version;

var gulp = require('gulp');
var bump = require('gulp-bump');
var semver = require('semver');
var shell = require('gulp-shell');
var argv = require('yargs').argv;
var path = require('path');

/**
 *
 * @param {Object} options
 *
 * @param {string[]|string} options.packages
 *  Array (or comma separated string) of json files where the "version" property should be bumped.
 *  Typical examples are `'./package.json'`, `'./bower.json'`, `'./component.json'`.
 *  It defaults to `['./package.json']`
 *
 * @param {string[]|string|Function} options.artifacts
 *  Array (or comma separated string) of build artifacts you want committed to the repo upon release.
 *  Each should be specified as relative path from your gulpfile (i.e. './dist/browser.min.js').
 *  It is recommended that you .gitignore these files, they will be forcefully added to your commit by this plugin.
 *
 *  If you specify a Function, it will be called with the *new* version string (i.e. `'1.0.2'`)
 *  as its first argument. It should return an Array of strings (or comma separated string) as specified above.
 *
 * @param {string[]|string} options.pre
 *  List of tasks required to generate artifacts.
 *  They will be run *after* package.json.version is bumped, but before committing and tagging it in git.
 *
 *
 * @params {string[]|string} options.post
 *  List of tasks to run post commit of the new release. This may include deleting the changelog, etc.
 *
 * -----------------------------------------------
 *
 * Your `pre` and `post` tasks can access the new version in a few ways:
 *
 *  1.  `require('./package.json').version`
 *  2.  process.env.PRE_BUMP_VERSION / process.env.POST_BUMP_VERSION
 *  3.  require('gulp/bump.js').version(); (this module exports a method `version` that will always return the new value)
 *
 * Note that option 1 presents a potential problem if you require and cache the value before
 *  the bump tasks runs. After incrementing the version bump will reject package.json from the
 *  require cache, so requiring package.json inline inside your task should give you the new
 *  version.
 */
function initTasks (options) {
  var pkgs = processOption(options, 'pkgs', ['./package.json']);
  pkgs = processOption(options, 'packages', pkgs);

  var artifacts = processOption(options, 'artifacts', null);

  var pre = processOption(options, 'pre', []);
  var post = processOption(options, 'post', []);

  pre.unshift('bump');
  post.unshift('_release');

  gulp.task('_bump', function () {
    return gulp.src(pkgs)
      .pipe(bump({
        version: version()
      }))
      .pipe(gulp.dest('./'));
  });

  gulp.task('_bump_invalidate_pkg',['_bump'], function(){
     delete require.cache[require.resolve(pkgJsonPath())];
  });

  gulp.task('bump',['_bump_invalidate_pkg']);

  gulp.task('_release', pre, function () {
    var versionString = 'v' + version();
    var message = 'Release ' + versionString;
    return shell.task([
      'git add -f ./browser/journaling-firebase.js',
      'git add ' + pkgs.join(' '),
      'git commit -m "' + message + '"',
      'git tag ' + versionString
    ])();
  });

  gulp.task('release', post);
}

var v;
function version () {
  if(v) return v;
  var previous = require(pkgJsonPath()).version;
  v = semver.inc(previous, argv.type || 'patch');
  process.env.PRE_BUMP_VERSION = previous;
  process.env.POST_BUMP_VERSION = v;
  return v;
}

function pkgJsonPath(){
  return './' + path.relative(__dirname, process.cwd() + '/package.json');
}

function processOption(options, optName, defaultValue) {
  if(!(options && options.hasOwnProperty(optName))){
    return defaultValue;
  }
  var arrayOrString = options[optName];

  if(typeof arrayOrString === 'string'){
    // can be specified as comma separated strings
    arrayOrString =  arrayOrString.split(',');
    for(var i = 0, l = arrayOrString.length; i < l; ++i){
      arrayOrString[i] = arrayOrString.trim();
    }
    return arrayOrString;
  }
  else if(Array.isArray(arrayOrString)) {
    // copy for safety
    return arrayOrString.slice();
  }

  throw Error('expect options.' + optName + ' to be an array of strings or comma separated string');
}