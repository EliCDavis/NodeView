/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var gulp =          require('gulp');
var browserify =    require("browserify");
var source =        require("vinyl-source-stream");
var uglify =        require("gulp-uglify");
var streamify =     require("gulp-streamify");
var minify =        require('gulp-minify');
var concat =        require('gulp-concat');


gulp.task('build', function() {
  gulp.src('./src/*.js')
    .pipe(concat('nodeview.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'));
});


gulp.task('default', function () {
    gulp.src('./src/*.js')
    .pipe(concat('nodeview.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/'));
});


gulp.task('test', function(){
    return browserify('src/main')
            .bundle()
            .pipe(source('nodeview.min.js'))
            .pipe(gulp.dest('public'));
});