var gulp   = require('gulp');
var uglify = require('gulp-uglify-es').default;
var concat = require('gulp-concat');
var gap    = require('gulp-append-prepend');
var mocha  = require('gulp-mocha');
var babel  = require('gulp-babel');
var inject = require('gulp-inject');
var clean  = require('gulp-clean');
var addsrc = require('gulp-add-src');
var fs     = require('fs');

var argv = require('yargs').argv;


// Get all JS file locations
var dirs = ['libraries', 'controllers', 'models', 'views'];

var paths = [];
function getJSPaths(prepend, cur) {
    var dir = prepend+cur+"/";
    var files = fs.readdirSync("site/public/"+dir);
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (file.endsWith(".js")) // If js file
            paths.push(dir+file);
        else if (!files.includes(".")) // If a directory
            getJSPaths(dir, file);
    }
}
for (var i = 0; i < dirs.length; i++)
    getJSPaths("js/", dirs[i]);

// var paths      = jspaths.map(function(file) { return 'site/public/js/' + file + ''; });
// var test_paths = jspaths.map(function(file) { return 'tests/public/js/' + file + ''; });


var isReleaseBuild = (argv.release === undefined ? false : true);
var buildTests     = (argv.tests === undefined ? false : true);

function devBuild(cb) {
    // var src = 'site/app/public/build.html';

    // return gulp.src(src)
    //   .pipe(inject(gulp.src(paths, {read: false}), {relative: true}))
    //   .pipe(concat('site/app/public/index.html'))
    //   .pipe(gulp.dest('.'));
      
    var config = 'site/data/config.txt';
    
    var contents = "DebugMode=true\n";
    contents += "Scripts=" + paths.join("|") + "\n";
        
    return fs.writeFile(config, contents, cb);
}

function releaseBuild(cb) {
    // var src = 'site/app/public/build.html';
    // 
    // // Create temporary combined js files
    // var combined = gulp.src(paths)
    //   .pipe(babel({presets: ['es2015']}))
    //   .pipe(uglify())
    //   .pipe(concat('./tmp.combined.js'))
    //   .pipe(gulp.dest('.'));
    // 
    // // Inject combined js file into HTML
    // var html = gulp.src(src)
    //   .pipe(inject(combined, {
    //       relative: true,
    //       transform: function(filePath, file) {
    //         return '<script>' + file.contents.toString('utf8') + '</script>';
    //       }
    //     }))
    //     .pipe(concat('site/app/public/index.html'))
    //   .pipe(gulp.dest('.'));
    // 
    // // Clean up temporary js file
    // return combined.pipe(clean());
    
    gulp.src(paths.map(function(f) { return 'site/public/' + f; }))
        .pipe(babel({presets: ['es2015']}))
        .pipe(uglify())
        .pipe(concat('site/public/js/combined-min.js'))
        .pipe(gulp.dest('.'));
    
    var config = 'site/data/config.txt';
    
    var contents = "DebugMode=false\n";
    contents += "Scripts=js/combined-min.js\n";
        
    return fs.writeFile(config, contents, cb);
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
