const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const connect = require('gulp-connect');
const cached = require('gulp-cached');
const s3 = require('gulp-s3');
const fs = require('fs');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');

const paths = {
	js : ['./src/scripts/LD32.js','./src/scripts/prop.js', './src/scripts/*.js'],
	resources: ['./src/resources/*.js', './src/resources/**/*.js'],
	shaders : ['./src/shaders/*.js'],
	css: ['./src/styles/*.css'],
	images: ['./src/images/*.png'],
	models: ['./src/models/*.bin','./src/models/*.gltf','./src/models/*.glsl'],
	sounds: ['./src/sounds/*.ogg'],
	html: ['./src/index.html'],
	controller: ['./src/controller/*']
};

gulp.task('default', ['build', 'connect', 'watch']);
gulp.task('build', ['js', 'html', 'resources', 'shaders', 'css', 'images', 'models', 'sounds', 'controller']);
gulp.task('live', ['build', 'watch', 'aws'], () => {
	gulp.watch('./dist/**', ['aws']);
});

gulp.task('resources', () => {
	gulp.src(paths.resources)
		.pipe(gulp.dest('./dist/resources/'));
});

gulp.task('shaders', () => {
	gulp.src(paths.shaders)
		.pipe(gulp.dest('./dist/shaders/'));
});

gulp.task('css', () => {
	gulp.src(paths.css)
		.pipe(gulp.dest('./dist/'));
});

gulp.task('images', () => {
	gulp.src(paths.images)
		.pipe(gulp.dest('./dist/images/'));
});

gulp.task('models', () => {
	gulp.src(paths.models)
		.pipe(gulp.dest('./dist/models/'));
});

gulp.task('sounds', () => {
	gulp.src(paths.sounds)
		.pipe(gulp.dest('./dist/sounds/'));
});

gulp.task('controller', () => {
	gulp.src(paths.controller)
		.pipe(gulp.dest('./dist/controller/'));
});

gulp.task('html', () => {
	gulp.src(paths.html)
		.pipe(gulp.dest('./dist/'));

	gulp.src('./src/favicon.png')
		.pipe(gulp.dest('./dist/'));
});

gulp.task('js', () => {
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

gulp.task('babel', () =>
  gulp.src('./src/scripts/LD32.js')
	.pipe(sourcemaps.init())
  .pipe(babel({
      presets: ['env']
  }))
  .pipe(concat('ld32.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('dist'))
);

gulp.task('connect', () => {
  connect.server({
  	root: './dist',
    port: 3000
  });
});

gulp.task('watch', () => {
	gulp.watch(paths.js, ['js']);
	gulp.watch(paths.resources, ['resources']);
	gulp.watch(paths.shaders, ['shaders']);
	gulp.watch(paths.css, ['css']);
	gulp.watch(paths.images, ['images']);
	gulp.watch(paths.models, ['models']);
	gulp.watch(paths.sounds, ['sounds']);
	gulp.watch(paths.html, ['html']);
	gulp.watch(paths.controller, ['controller']);
});

gulp.task('aws', () => {
	aws = JSON.parse(fs.readFileSync('./aws.json'));

	gulp.src('./dist/**')
		.pipe(cached('dist'))
		.pipe(s3(aws));
});
