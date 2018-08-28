var gulp   = require('gulp');
var uglify = require('gulp-uglify-es').default;
var concat = require('gulp-concat');
var gap    = require('gulp-append-prepend');
var mocha  = require('gulp-mocha');
var babel  = require('gulp-babel');
var addsrc = require('gulp-add-src');
var fs     = require('fs');

var argv = require('yargs').argv;


// Get all JS file locations
var dirs = ['libraries', 'controllers', 'models', 'views'];

var paths = [];
var test_paths = [];
function getJSPaths(prepend, cur, arr, homeDir) {
    var dir = prepend+cur+"/";
    if (!fs.existsSync(homeDir+dir))
        return;
    var files = fs.readdirSync(homeDir+dir);
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (file.endsWith('.js')) // If js file
            arr.push(dir+file);
        else if (!files.includes('.')) // If a directory
            getJSPaths(dir, file, arr, homeDir);
    }
}
for (var i = 0; i < dirs.length; i++) {
    getJSPaths('js/', dirs[i], paths, 'site/public/');
    getJSPaths('js/', dirs[i], test_paths, 'tests/public/');
}

var isReleaseBuild = (argv.release === undefined ? false : true);
var buildTests     = (argv.tests === undefined ? false : true);

function devBuild(cb) {
    var config = 'site/data/config.txt';
    
    var contents = 'DebugMode=true\n';
    contents += 'Scripts=' + paths.join('|') + '\n';
        
    return fs.writeFile(config, contents, cb);
}

function releaseBuild(cb) {
    gulp.src(paths.map(function(f) { return 'site/public/' + f; }))
        .pipe(babel({presets: ['es2015']}))
        .pipe(uglify())
        .pipe(concat('site/public/js/combined-min.js'))
        .pipe(gulp.dest('.'));
    
    var config = 'site/data/config.txt';
    
    var contents = 'DebugMode=false\n';
    contents += 'Scripts=js/combined-min.js\n';
        
    return fs.writeFile(config, contents, cb);
}

function testsBuild() {
    // Combine js files and append tests
    return gulp.src(paths.map(function(f) { return 'site/public/' + f; })) // Get rid of prepend
      .pipe(concat('tests/index.js'))
      .pipe(gap.prependFile('tests/prepend.js'))
      .pipe(gap.appendText('start();'))
      .pipe(addsrc.append(test_paths.map(function (f) { return 'tests/public/' + f; })))
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
