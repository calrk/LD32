var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var connect = require('gulp-connect');
var s3 = require('gulp-s3');
var fs = require('fs');

var paths = {
	js : ['./src/scripts/LD32.js', './src/scripts/*.js'],
	resources: ['./src/resources/*.js', './src/resources/**/*.js'],
	shaders : ['./src/shaders/*.js'],
	css: ['./src/styles/*.css'],
	images: ['./src/images/*.png'],
	models: ['./src/models/*.bin','./src/models/*.gltf','./src/models/*.glsl'],
	sounds: ['./src/sounds/*.ogg'],
	html: ['./src/index.html'],
	controller: ['./src/controller/*']
};

gulp.task('default', ['js', 'html', 'resources', 'shaders', 'css', 'images', 'models', 'sounds', 'controller', 'connect', 'watch']);
gulp.task('build', ['js']);

gulp.task('resources', function(){
	gulp.src(paths.resources)
		.pipe(gulp.dest('./dist/resources/'));
});

gulp.task('shaders', function(){
	gulp.src(paths.shaders)
		.pipe(gulp.dest('./dist/shaders/'));
});

gulp.task('css', function(){
	gulp.src(paths.css)
		.pipe(gulp.dest('./dist/'));
});

gulp.task('images', function(){
	gulp.src(paths.images)
		.pipe(gulp.dest('./dist/images/'));
});

gulp.task('models', function(){
	gulp.src(paths.models)
		.pipe(gulp.dest('./dist/models/'));
});

gulp.task('sounds', function(){
	gulp.src(paths.sounds)
		.pipe(gulp.dest('./dist/sounds/'));
});

gulp.task('controller', function(){
	gulp.src(paths.controller)
		.pipe(gulp.dest('./dist/controller/'));
});

gulp.task('html', function(){
	gulp.src(paths.html)
		.pipe(gulp.dest('./dist/'));

	gulp.src('./src/favicon.png')
		.pipe(gulp.dest('./dist/'));
});

gulp.task('js', function(){
	gulp.src(paths.js)
		.pipe(concat('ld32.js'))
		// .pipe(uglify())
		.pipe(gulp.dest('./dist/'));

/*	gulp.src(paths.js)
		.pipe(concat('clarity.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('./examples/js/'))
		.pipe(gulp.dest('./build/'));*/
});

gulp.task('connect', function () {
  connect.server({
  	root: './dist',
    port: 3000
  });
});

gulp.task('watch', function () {
	gulp.watch(paths.js, ['js']);
});

gulp.task('aws', function(){
	aws = JSON.parse(fs.readFileSync('./aws.json'));

	gulp.src('./dist/**')
		.pipe(s3(aws));
});