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
function getJSPaths(dir) {
    function getJSPaths2(prepend, cur, arr, homeDir) {
        var dir = prepend+cur+"/";
        if (!fs.existsSync(homeDir+dir))
            return;
        var files = fs.readdirSync(homeDir+dir);
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.endsWith('.js')) // If js file
                arr.push(dir+file);
            else if (!files.includes('.')) // If a directory
                getJSPaths2(dir, file, arr, homeDir);
        }
    }
    var dirs = ['libraries', 'controllers', 'models', 'views'];
    var paths = [];
    for (var i = 0; i < dirs.length; i++)
        getJSPaths2('js/', dirs[i], paths, dir);
    return paths;
}
function getPaths() {
    return getJSPaths('site/public/');
}
function getTestPaths() {
    return getJSPaths('tests/public/');
}

function getItems() {
    var dirs = ['Inputs', 'Outputs', 'Gates', 'FlipFlops', 'Other'];
    var items = [];
    for (var i = 0; i < dirs.length; i++) {
        var dir = dirs[i].toLowerCase();
        var files = fs.readdirSync('site/public/js/models/ioobjects/'+dir);
        var imgFiles = fs.readdirSync('site/public/img/icons/'+dir);
        var curItems = [dirs[i]];
        for (var j = 0; j < files.length; j++) {
            var itemName = files[j].substring(0, files[j].lastIndexOf('.'));
            if (files[j].endsWith('.js') && imgFiles.includes(itemName.toLowerCase()+'.svg'))
                curItems.push(itemName);
        }
        items.push(curItems.join('&'));
    }
    return items;
}



var isReleaseBuild = (argv.release === undefined ? false : true);
var buildTests     = (argv.tests === undefined ? false : true);

function buildConfig(debugMode, scripts, items, cb) {
    var config = 'site/data/config.txt';
    
    var contents = 'DebugMode='+debugMode+'\n';
    contents += 'Scripts='+scripts.join('|')+'\n';
    contents += 'Items='+items.join('|')+'\n';
        
    return fs.writeFile(config, contents, cb);
}

function devBuild(cb) {
    return buildConfig(true, getPaths(), getItems(), cb);
}

function releaseBuild(cb) { 
    // Combine js files and minify them   
    gulp.src(getPaths().map(function(f) { return 'site/public/' + f; }))
        .pipe(babel({presets: ['es2015']}))
        .pipe(uglify())
        .pipe(concat('site/public/js/combined-min.js'))
        .pipe(gulp.dest('.'));
    
    return buildConfig(false, ['js/combined-min.js'], getItems(), cb);
}

function testsBuild() {
    // Combine js files and append tests
    return gulp.src(getPaths().map(function(f) { return 'site/public/' + f; })) // Get rid of prepend
      .pipe(concat('tests/index.js'))
      .pipe(gap.prependFile('tests/prepend.js'))
      .pipe(gap.appendText('start();'))
      .pipe(addsrc.append(getTestPaths().map(function (f) { return 'tests/public/' + f; })))
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
