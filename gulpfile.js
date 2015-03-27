'use strict';

var $ = require('gulp-stack').plugins;

$.less = require('gulp-less');
$.yaml = require('gulp-yaml');
var staticFiles = [
    {
        name: 'locales',
        folder: 'dist/',
        src: 'app/locales/**.yml',
        pipe: $.lazypipe().pipe($.concat, 'locale.json').pipe($.yaml)
    },
    {
        name: 'overwrite',
        folder: 'dist/',
        src: 'app/overwrite.js'
    },
    {
        name: 'jassa',
        folder: 'dist/scripts',
        src: 'app/bower_components/jassa/*.min.js'
    },
    {
        name: 'fonts',
        folder: 'dist/fonts',
        src: '$vendor',
        filter: ['{f,F}ont*.{otf,eot,svg,ttf,woff,woff2}']
    },
    {
        name: 'images',
        folder: 'dist/images',
        src: 'app/images/*',
        pipe: $.lazypipe().pipe($.imagemin)
    }
];

var bowerCSS = function () {
    return gulp.src('app/styles/styles.less')
        .pipe($.less())
};

var gulp = require('gulp-stack').gulp([
        'clean',
        'app',
        'vendor',
        'static',
        'develop',
        'html'
    ],
    {
        files: {
            js: ['app/**/*.js', '!app/overwrite.js'],
            static: staticFiles
        },
        injectInto: {
            css: bowerCSS
        },
        bower: 'app/bower_components/**', // String of bower directory string
        templateCacheOptions: {root: '/', module: 'VSB'}
    }
);

/**
 * Alias Tasks
 */

//gulp.newTask('default', ['build', 'jshint', 'test']);
gulp.newTask('default', ['build', 'jshint']);

gulp.newTask('build', ['html', 'app', 'static', 'vendor']);

gulp.task('dev', ['develop', 'watch.less', 'jassa', 'locale']);

gulp.task('watch.less', function () {
    $.watch('app/**/*.less', function () {
        gulp.start('less');
    })
});

gulp.task('less', function () {
    return gulp.src('app/styles/styles.less')
        .pipe($.less())
        .pipe($.autoprefixer({
            browsers: ['> 1%', 'last 4 versions', 'Firefox ESR', 'Opera 12.1'],
            cascade: true
        }))
        .pipe(gulp.dest('app/styles/'));
});

gulp.task('jassa', function () {
    return gulp.src('app/bower_components/jassa/*.min.js')
        .pipe(gulp.dest('.tmp/scripts/'))
});

gulp.task('locale', function () {
    return gulp.src('app/locales/**.yml')
        .pipe($.concat('locale.json'))
        .pipe($.yaml({space: 2}))
        .pipe(gulp.dest('.tmp'))
});