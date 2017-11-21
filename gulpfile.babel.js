var gulp = require('gulp');
var uglify = require('gulp-uglify-es').default; 
var concat = require('gulp-concat');
var gap = require('gulp-append-prepend');
var mocha = require('gulp-mocha');

var dest = "site/app/public/js/combined.js";
var dest_min = "site/app/public/js/combined-min.js";

var lib = ["libraries/**/*"];
var controller = ["controllers/**/*"];
var model = ["models/*", "models/ioobjects/**/*"];
var view = ["views/*"];

var files = lib.concat(controller, model, view);
var paths = files.map(function(file) { return "site/app/public/js/" + file + ".js"; });
var test_paths = files.map(function(file) { return "tests/app/public/js/" + file + ".js"; });

function build() {
    gulp.src(paths)
      .pipe(concat(dest))
      .pipe(gap.prependText("/* Built at: " + (new Date()).toString() + " */\n"))
      .pipe(gap.prependText("var __TESTING__ = false;\n\n"))
      .pipe(gulp.dest("."))
      .pipe(uglify())
      .pipe(concat(dest_min))
      .pipe(gulp.dest("."));
      
    gulp.src(paths.concat(test_paths))
      .pipe(concat("tests/index.js"))
      .pipe(gap.prependFile("tests/prepend.js"))
      .pipe(gap.prependText("/* Built at: " + (new Date()).toString() + " */\n"))
      .pipe(gap.appendText("start();"))
      .pipe(gulp.dest("."));
}

function test() {
    return gulp.src("tests/index.js")
    .pipe(mocha());
}


gulp.task('build', build);
gulp.task('test', test);