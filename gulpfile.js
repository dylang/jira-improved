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
var watch = require('gulp-watch');

var livereload = require('gulp-livereload');

gulp.task('browserify', function() {
    var bundler = watchify(browserify({
        entries: ['./src/js/content/improved'],
        debug: true}, watchify.args
    ));

    // Optionally, you can apply transforms
    // and other configuration options on the
    // bundler just as you would with browserify
    //bundler.transform('brfs');

    function rebundle() {
        return bundler.bundle()
            .pipe(source('bundle.js'))
            .pipe(gulp.dest('src/js/dist'))
            .pipe(livereload());
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
        .pipe(watch())
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});


gulp.task('zip', function () {

    var name = require('./package.json').name;

    return gulp.src(['./src/**'])
        //.pipe(debug({verbose: true}))
        .pipe(zip(name + '.zip', {compress: true}))
        //.pipe(debug({verbose: true}))
        .pipe(gulp.dest('zips'));
});

gulp.task('live-reload', livereload.listen);


gulp.task('watch',function() {
    gulp.watch(['src/**', '!src/js/content/**']).on('change', livereload.changed);
});

gulp.task('default', ['live-reload', 'watch', 'jshint', 'browserify']);

