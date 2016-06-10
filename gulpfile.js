/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var gulp = require('gulp');
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var uglify = require("gulp-uglify");
var streamify = require("gulp-streamify");
var minify = require('gulp-minify');
var concat = require('gulp-concat');


gulp.task('build-all', function () {
    
    gulp.src('./src/*.js')
            .pipe(concat('nodeview.all.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('./dist/'));

    gulp.src('./src/*.js')
            .pipe(concat('nodeview.all.js'))
            .pipe(gulp.dest('./dist/'));
    
    gulp.src(['./src/*2D.js', './src/Util.js'])
            .pipe(concat('nodeview.2D.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('./dist/'));
    
    gulp.src(['./src/*2D.js', './src/Util.js'])
            .pipe(concat('nodeview.2D.js'))
            .pipe(gulp.dest('./dist/'));
    
//    return browserify('./demo/app/main')
//            .bundle()
//            .pipe(source('app.js'))
//            .pipe(streamify(uglify()))
//            .pipe(gulp.dest('./demo'))

});


gulp.task('run', function () {
    gulp.src('./src/*.js')
            .pipe(concat('nodeview.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('./demo/'));
});


gulp.task('debug', function () {
    gulp.src('./src/*.js')
            .pipe(concat('nodeview.min.js'))
            .pipe(gulp.dest('./demo/'));
});