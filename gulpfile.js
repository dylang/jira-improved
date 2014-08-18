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
var bump = require('gulp-bump');
var jeditor = require('gulp-json-editor');
var rename = require('gulp-rename');

var watch = require('gulp-watch');
var livereload = require('gulp-livereload');

var liveReloadEnabled;

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
        .pipe(watch({name: 'jshint watch'}))
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('zip', ['manifest'], function () {

    var pkg = require('./package.json');


    return gulp.src(['./src/**'])
        .pipe(zip(pkg.name + '-' + pkg.version + '.zip', {compress: true}))
        .pipe(gulp.dest('zips'));
});

gulp.task('bump', function(){
    return gulp.src('./package.json')
        .pipe(bump())
        .pipe(gulp.dest('./'));
});

gulp.task('manifest', ['bump'], function(){
    return gulp.src('./src/manifest.tmpl.json')
        .pipe(jeditor(function(json){
            json.version = require('./package.json').version;
            return json;
        }))
        .pipe(rename('manifest.json'))
        .pipe(gulp.dest('./src'));
});

gulp.task('manifest-livereload', function(){
    return gulp.src('./src/manifest.tmpl.json')
        .pipe(jeditor(function(json){
            json.background.scripts.push('js/live-reload.js');
            return json;
        }))
        .pipe(rename('manifest.json'))
        .pipe(gulp.dest('./src'));
});

gulp.task('live-reload', livereload.listen);

gulp.task('watch',function() {
    liveReloadEnabled = true;
    gulp.watch(['src/**', '!src/js/content/**'])
        .on('change', livereload.changed);
});

gulp.task('default', ['live-reload', 'manifest-livereload', 'watch', 'jshint', 'browserify']);
gulp.task('build', ['zip']);
