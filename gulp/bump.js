module.exports = initTasks;
initTasks.version = newVersion;

var gulp = require('gulp');
var bump = require('gulp-bump');
var semver = require('semver');
var shell = require('gulp-shell');
var argv = require('yargs').argv;
var path = require('path');
var gutil = require('gulp-util');

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
 *  If you specify a Function, it will be called with the version string (i.e. `'1.0.2'`)
 *  as its first argument. It should return an Array of strings (or comma separated string) as specified above.
 *
 * @param {string[]|string} options.pre
 *  List of tasks required to generate artifacts.
 *  They will be run before committing and tagging it in git.
 *
 */
function initTasks (options) {
  var pkgs = processOption(options, 'pkgs', ['./package.json']);
  pkgs = processOption(options, 'packages', pkgs);

  var artifacts = processOption(options, 'artifacts', null);

  var pre = processOption(options, 'pre', []);
  var dryRun = options && (options.skipCommit || options.dryRun);

  gulp.task('pre_release', pre);

  gulp.task('commit_release', ['pre_release'], function () {
    var versionString = 'v' + oldVersion();
    var message = 'Release ' + versionString;

    var commands =[
      'git add ' + pkgs.join(' '),
      'git commit -m "' + message + '"',
      'git tag ' + versionString
    ];

    if (artifacts) {
      commands.unshift('git add -f ' + artifacts.join(' '));
    }

    if (dryRun) {
      gutil.log('dry run, would have executed\n   ' + gutil.colors.yellow(commands.join('\n   ')));
      return;
    }

    return shell.task(commands)();
  });

  gulp.task('bump', ['commit_release'], function () {
    return gulp.src(pkgs)
      .pipe(bump({
        version: newVersion()
      }))
      .pipe(gulp.dest('./'));
  });

  gulp.task('release',['bump'], function() {
    var versionString = 'v' + newVersion();
    var message = 'Bumping version to: ' + versionString;

    var commands = [
      'git add ' + pkgs.join(' '),
      'git commit -m "' + message + '"'
    ];

    if (dryRun) {
      gutil.log('dry run, would have executed\n   ' + gutil.colors.yellow(commands.join('\n   ')));
      return;
    }

    return shell.task(commands)();
  });

}

var _newVersion, _oldVersion;
function newVersion () {
  if(_newVersion) return _newVersion;
  var relativePath = './' + path.relative(__dirname, process.cwd() + '/package.json');
  _oldVersion = require(relativePath).version;
  _newVersion = semver.inc(_oldVersion, type());
  process.env.PRE_BUMP_VERSION = _oldVersion;
  process.env.POST_BUMP_VERSION = _newVersion;
  return _newVersion;
}

function oldVersion (){
  newVersion();
  return _oldVersion;
}

function type () {
  return argv.type || 'patch';
}

function processOption(options, optName, defaultValue) {
  if(!(options && options.hasOwnProperty(optName))){
    return defaultValue;
  }
  var arrayOrString = options[optName];

  if(typeof arrayOrString === 'function'){
    arrayOrString = arrayOrString(oldVersion(), newVersion());
  }

  if(typeof arrayOrString === 'string'){
    // can be specified as comma separated strings
    arrayOrString =  arrayOrString.split(',');
    for(var i = 0, l = arrayOrString.length; i < l; ++i){
      arrayOrString[i] = arrayOrString[i].trim();
    }
    return arrayOrString;
  }
  else if(Array.isArray(arrayOrString)) {
    // copy for safety
    return arrayOrString.slice();
  }

  throw Error('expect options.' + optName + ' to be an array of strings or comma separated string');
}