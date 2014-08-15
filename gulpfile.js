'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
//var debug = require('gulp-debug');

var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var zip = require('gulp-zip');

var browserSync = require('browser-sync');

gulp.task('browserify', function() {
    var bundler = watchify(browserify({
        entries: ['./src/js/content/improved'],
        debug: true}, watchify.args
    ));

    //(process.cwd() + '/', watchify.args));

    // Optionally, you can apply transforms
    // and other configuration options on the
    // bundler just as you would with browserify
    //bundler.transform('brfs');

    function rebundle() {
        return bundler.bundle()
            .pipe(source('bundle.js'))
            .pipe(gulp.dest('src/js/dist'));
    }

    bundler
        .on('update', rebundle)
        // log errors if they happen
        .on('error', function(e) {
          gutil.log('Browserify Error', e);
        });

    return rebundle();
});

gulp.task('jshint', function(){
    return gulp.src([
            'gulpfile.js',
            'src/**/*.js',
            '!src/js/dist/**'
        ])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});


gulp.task('browser-sync', ['browserify'], function() {
    browserSync.init({
        server: {
            baseDir: ['src']
        },
        open: false
    });
});

gulp.task('zip', function () {

    var name = require('./src/manifest.json').name;

    return gulp.src(['src'])
        //.pipe(debug({verbose: true}))
        .pipe(zip(name + '.zip', {compress: true}))
        //.pipe(debug({verbose: true}))
        .pipe(gulp.dest('zips'));
});


//gulp.task('build', ['jshint', 'browserify']);

gulp.task('watch', ['browser-sync'], function() {
    gulp.watch('src', ['jshint']);
    gulp.watch('src/**/*.js', ['jshint', browserSync.reload]);
});

gulp.task('default', ['watch']);

