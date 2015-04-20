var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var connect = require('gulp-connect');
var s3 = require('gulp-s3');
var fs = require('fs');

var paths = {
	js : ['./scripts/*.js']
};

gulp.task('default', ['js', 'connect', 'watch']);
gulp.task('build', ['js']);

gulp.task('js', function(){
	gulp.src(paths.js)
		.pipe(concat('ld32.js'))
		.pipe(gulp.dest('./build/'));

/*	gulp.src(paths.js)
		.pipe(concat('clarity.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('./examples/js/'))
		.pipe(gulp.dest('./build/'));*/
});

gulp.task('connect', function () {
  connect.server({
    port: 3000
  });
});

gulp.task('watch', function () {
	gulp.watch(paths.js, ['js']);
});

gulp.task('aws', function(){
	aws = JSON.parse(fs.readFileSync('./aws.json'));

	gulp.src('./examples/**')
		.pipe(s3(aws));
});