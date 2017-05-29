import gulp from 'gulp'
import notify from 'gulp-notify'
import plumber from 'gulp-plumber'

//css processing
import stylus from 'gulp-stylus'
import rupture from 'rupture'
import rucksack from 'gulp-rucksack'
import cssnano from 'gulp-cssnano'
import concatCSS from 'gulp-concat-css'

//postCSS modules
import postcss from 'gulp-postcss' 
import autoprefixer from 'autoprefixer'
import lost from 'lost'

//js processing
import uglify from 'gulp-uglify'
import babel from 'gulp-babel'

// HTML processing
import pug from 'gulp-pug'

//browser-sync
import browserSync from 'browser-sync'
const reload = browserSync.reload;

//from a Wes Bos tutorial
function handleErrors() {
    //arguments needs to be an array, so slicey-dicey.
    var args = Array.prototype.slice.call(arguments)
    console.log(args);
    notify.onError({
        title: "Gulp done fucked up",
        message: '<% error.message %>'
    }).apply(this, args); //apply - not call - the notify.onError. 
    this.emit('end'); //keeps gulp from hanging on task
}

//process our styles
gulp.task('styles', function() {

    return gulp.src('build/styles/**/*.styl')
        .pipe(plumber({ errorHandler: handleErrors }))
        .pipe(stylus({
            use: [ rupture() ]
        }))
        .pipe( postcss([
            lost(),
            autoprefixer({browsers: ['last 2 versions']}),
        ]))
        .pipe( rucksack() )
        .pipe( concatCSS('bundle.css') )
        .pipe( cssnano() )
        .pipe( gulp.dest('./public/assets/css/') )
        .pipe( notify("CSS good to go!") )
});

//minify our js, transpile any es6
gulp.task('minify', function(){

    return gulp.src('build/js/*.js')
        .pipe(plumber({ errorHandler: handleErrors }))
        .pipe (babel({
            presets: ["es2015"]
        }))
        .pipe( uglify() )
        .pipe( gulp.dest('public/assets/js') )
        .pipe( reload({stream:true}) );
});

//do the browser_sync thing; open the local server and use the public director for our base directory
gulp.task('browserSync', function() {
    browserSync({
        server: { baseDir: './public/'}
    });
});

// used for any html processing we wanna use in the future
gulp.task('processHTML', function() {
    return gulp.src('build/templates/*.pug')
        .pipe( plumber({ errorHandler: handleErrors}) )
        .pipe( pug({
            // pass this option to make sure our HTML isn't minimized
            pretty: true
        }))
        .pipe( gulp.dest('./public/'))
        .pipe( notify("HTML compiled!") )
        .pipe( reload({stream:true}) );
})

//watch, style and reload 
gulp.task('watch', function() {

    //our the tasks used to compile styles, move HTML  and uglify JS  
    gulp.watch('./build/**/*.pug', ['processHTML'])
    gulp.watch('./build/styles/**/*.styl', ['styles']);
    gulp.watch('./build/js/*.js', ['minify']);

    //reload when these files have compiled & changed
    gulp.watch('./public/**/*.html', reload);
    gulp.watch('./public/assets/css/*.css', reload);
    gulp.watch('./public/assets/js/*.js', reload);

});

//default task runs on gulp command in CLI - run styles, open up browsersync and watch our files
gulp.task('default', ['styles', 'minify','browserSync', 'processHTML', 'watch'])