var gulp = require('gulp');
var path = require('path');
var del = require('del');
var $ = require('gulp-load-plugins')();
var browserify = require('browserify');
var babelify = require('babelify');
var fs = require('fs');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

// set variable via $ gulp --type prod
var environment = $.util.env.type || 'dev';
var isProduction = environment === 'prod';

var port = $.util.env.port || 9666;
var src = 'src/';
var dist = 'dist/';
var example = 'example/';

// https://github.com/ai/autoprefixer
var autoprefixerBrowsers = [
  'ie >= 9',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 6',
  'opera >= 23',
  'ios >= 6',
  'android >= 4.4',
  'bb >= 10'
];

gulp.task('scripts', function() {
  return browserify(src+'scripts/DailymotionFollow.jsx', { debug: true })
            .transform(babelify)
            .exclude('react')
            .bundle()
            .pipe(source('react-dailymotion-follow.js'))
            .pipe(buffer())
            .pipe($.sourcemaps.init())
            .pipe($.sourcemaps.write())
            .pipe(gulp.dest(dist))
            .pipe($.rename('react-dailymotion-follow.min.js'))
            .pipe($.uglifyjs())
            .pipe(gulp.dest(dist))
            .pipe($.connect.reload());
});

gulp.task('example', function(){
  return gulp.src(example + 'example.jsx')
    .pipe($.babel())
    .pipe(gulp.dest(example));
});

// copy html from app to dist
gulp.task('html', function() {
  return gulp.src(src + 'index.html')
    .pipe(gulp.dest(dist))
    .pipe($.size({ title : 'html' }))
    .pipe($.connect.reload());
});

gulp.task('styles', function () {
  gulp.src([
      src + 'styles/main.scss',
    ])
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      style: 'compressed'
    }))
    .pipe($.autoprefixer({browsers: autoprefixerBrowsers}))
    .pipe($.sourcemaps.write())
    .pipe($.concat('react-dailymotion-follow.css'))
    .pipe(gulp.dest(dist))
    .pipe($.connect.reload());
});

// add livereload on the given port
gulp.task('serve', function() {
  $.connect.server({
    root: __dirname,
    port: port,
    livereload: {
      port: 35720
    }
  });
});

// copy images
gulp.task('images', function(cb) {
  return gulp.src(src + 'images/**/*.{png,jpg,jpeg,gif}')
    .pipe($.size({ title : 'images' }))
    .pipe(gulp.dest(dist + 'images/'));
});

// watch styl, html and js file changes
gulp.task('watch', function() {
  gulp.watch(src + 'styles/**/*.scss', ['styles']);
  gulp.watch(src + 'scripts/*.jsx', ['scripts']);
  gulp.watch([
    example + '*.jsx',
    example + '*.html'
  ], ['example']);
});

// remove bundels
gulp.task('clean', function(cb) {
  del([dist], cb);
});


// by default build project and then watch files in order to trigger livereload
gulp.task('default', ['build', 'serve', 'watch']);

// waits until clean is finished then builds the project
gulp.task('build', ['clean'], function(){
  gulp.start(['html', 'scripts','example', 'styles']);
});
