/* 
 * The MIT License
 *
 * Copyright 2016 Eli Davis.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


var gulp = require('gulp');
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var uglify = require("gulp-uglify");
var streamify = require("gulp-streamify");
var notify = require("gulp-notify");
var watchify = require('watchify');
var gutil = require('gulp-util');

var graphLocation = "./src/Graph/Graph2D";

gulp.task('build-all', ['build-unmin', 'build-min']);

gulp.task('build-unmin', function(){
    browserify(graphLocation, {standalone: "Graph2D"})
        .bundle()
        .pipe(source('nodeview.js'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('build-min', function(){
    browserify(graphLocation, {standalone: "Graph2D"})
        .bundle()
        .pipe(source('nodeview.min.js'))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('run', function () {
    browserify(graphLocation, {standalone: "Graph2D"})
        .bundle()
        .pipe(source('nodeview.min.js'))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest('./demo/'));
});

gulp.task('debug', function () {
    browserify(graphLocation, {standalone: "Graph2D"})
        .bundle()
        .pipe(source('nodeview.min.js'))
        .pipe(gulp.dest('./demo/'));
});


var scriptsDir = './src/Graph';
var buildDir = './demo';

function handleErrors() {
    var args = Array.prototype.slice.call(arguments);
    notify.onError({
        title: "Compile Error",
        message: "<%= error.message %>"
    }).apply(this, args);
    this.emit('end'); // Keep gulp from hanging on this task
}

// Based on: http://blog.avisi.nl/2014/04/25/how-to-keep-a-fast-build-with-browserify-and-reactjs/
function buildScript(file, watch, minify) {
    
    minify = minify || false;
    
    var props = {entries: [scriptsDir + '/' + file], debug: true, cache: {}, packageCache: {}, standalone: "Graph2D"};
    var bundler = watch ? watchify(browserify(props)) : browserify(props);
    function rebundle() {
        var stream = bundler.bundle();
        if(minify){
            return stream.on('error', handleErrors)
                .pipe(source(file))
                .pipe(streamify(uglify()))
                .pipe(gulp.dest(buildDir + '/'));
        } else {
            return stream.on('error', handleErrors)
                .pipe(source(file))
                .pipe(gulp.dest(buildDir + '/'));
        }
        
    }
    bundler.on('update', function () {
        rebundle();
        gutil.log('Rebundle...');
    });
    return rebundle();
}

gulp.task('build', function () {
    return buildScript('Graph2D.js', false, true);
});

gulp.task('default', ['build'], function () {
    return buildScript('Graph2D.js', true);
});