var gulp = require('gulp');
var uglify = require('gulp-uglify-es').default;
var concat = require('gulp-concat');
var gap = require('gulp-append-prepend');
var mocha = require('gulp-mocha');
var babel = require('gulp-babel');
var inject = require('gulp-inject');
var clean = require('gulp-clean');
var addsrc = require('gulp-add-src');

var argv = require('yargs').argv;


// Get all JS file locations
var lib = ['libraries/**/*'];
var controller = ['controllers/**/*'];
var model = ['models/*', 'models/ioobjects/**/*'];
var view = ['views/*'];

var files = lib.concat(controller, model, view);
var paths = files.map(function(file) { return 'site/app/public/js/' + file + '.js'; });
var test_paths = files.map(function(file) { return 'tests/app/public/js/' + file + '.js'; });


var isReleaseBuild = (argv.release === undefined ? false : true);
var buildTests     = (argv.tests === undefined ? false : true);

function devBuild() {
    var src = 'site/app/public/build.html';

    return gulp.src(src)
      .pipe(inject(gulp.src(paths, {read: false}), {relative: true}))
      .pipe(concat('site/app/public/index.html'))
      .pipe(gulp.dest('.'));
}

function releaseBuild() {
    var src = 'site/app/public/build.html';

    // Create temporary combined js files
    var combined = gulp.src(paths)
      .pipe(babel({presets: ['es2015']}))
      .pipe(uglify())
      .pipe(concat('./tmp.combined.js'))
      .pipe(gulp.dest('.'));

    // Inject combined js file into HTML
    var html = gulp.src(src)
      .pipe(inject(combined, {
          relative: true,
          transform: function(filePath, file) {
            return '<script>' + file.contents.toString('utf8') + '</script>';
          }
        }))
        .pipe(concat('site/app/public/index.html'))
      .pipe(gulp.dest('.'));

    // Clean up temporary js file
    return combined.pipe(clean());
}

function testsBuild() {
    // Combine js files and append tests
    return gulp.src(paths) // Get rid of prepend
      .pipe(concat('tests/index.js'))
      .pipe(gap.prependFile('tests/prepend.js'))
      .pipe(gap.appendText('start();'))
      .pipe(addsrc.append(test_paths))
      .pipe(concat('tests/index.js'))
      .pipe(gulp.dest('.'));
}

function test() {
    return gulp.src('tests/index.js')
      .pipe(mocha());
}

if (buildTests)
  gulp.task('build', testsBuild);
else
  gulp.task('build', (isReleaseBuild ? releaseBuild : devBuild));
gulp.task('test', test);
