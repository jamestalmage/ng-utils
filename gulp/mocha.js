module.exports = initiateTasks;

var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');

/**
 * Run tests in Node.js using the Mocha test runner.
 *
 * Creates three tasks:
 *
 * . `mocha`: single run of tests,
 * . `mocha-watch`: watch and run tests,
 * . `mocha-coverage`: single run with coverage
 *
 * Takes a single `options` parameter with the following properties
 * . `watch`: array of glob patterns for files to watch (used by the `mocha-watch` task).
 * . `sources` : array of glob patterns for source files (used by the `mocha-coverage` task).
 * . `tests` : array of glob patterns for test source files (used by all taskes).
 *
 * @param options config options for the tasks.
 */
function initiateTasks(options){

  var watch = options && options.watch || ['test/**', 'index.js', 'src/**'];
  var sources = options && options.sources || ['./src/*.js','./src/**/*.js'];
  var testSources = options && (options.testSources || options.tests) || ['test/*.js', 'test/**/*.js'];

  gulp.task('mocha', mochaTask);

  gulp.task('mocha-watch', function () {
    gulp.watch(watch, ['mocha']);
    mochaTask();
  });

  gulp.task('_mocha-cover', function () {
    return gulp.src(sources)
      .pipe(istanbul())
      .pipe(istanbul.hookRequire());
  });

  gulp.task('mocha-coverage', ['_mocha-cover'], function () {
    return mochaTask()
      .pipe(istanbul.writeReports());
  });

  function mochaTask(){
    return gulp.src(testSources, {read:false})
      .pipe(mocha({
        growl:true
      }))
      .on('error',logMochaError);
  }
}

function logMochaError(err){
  try {
    if(err && err.message){
      gutil.log(err.message);
    } else {
      gutil.log.apply(gutil,arguments);
    }
  } catch (e){
    gutil.log(err.message);
  }

}