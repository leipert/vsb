'use strict';

var gulp = require('gulp');

var $ = require('gulp-stack').plugins(gulp);

$.imagemin = require('gulp-imagemin');
$.less = require('gulp-less');
$.yaml = require('gulp-yaml');

var buildPath = 'dist';

var staticFiles = [
    {
        name: 'locales',
        src: 'app/locales/**.yml',
        pipe: $.lazypipe()
            .pipe($.concat, 'locale.json')
            .pipe($.yaml)
    },
    {
        name: 'overwrite',
        src: 'app/overwrite.js'
    },
    {
        name: 'jassa',
        folder: '/scripts',
        rev: true,
        src: 'app/bower_components/jassa/*.min.js'
    },
    {
        name: 'fonts',
        folder: 'fonts',
        src: '$vendor',
        rev: true,
        filter: ['{f,F}ont*.{otf,eot,svg,ttf,woff,woff2}']
    },
    {
        name: 'images',
        folder: 'images',
        rev: true,
        src: 'app/images/*',
        pipe: $.lazypipe()
            .pipe($.imagemin)
    }
];

gulp = require('gulp-stack').gulp(gulp, [
        'app',
        'vendor',
        'static',
        'develop',
        'html',
        'rev'
    ],
    {
        files: {
            js: ['app/**/*.js', '!app/overwrite.js'],
            watch : '!app/styles/styles.css',
            static: staticFiles
        },
        injectInto: {
            css: gulp.src('app/styles/styles.less').pipe($.less())
        },
        paths: {
            build: buildPath
        },
        bower: 'app/bower_components/**', // String of bower directory path
        templateCacheOptions: {root: '/', module: 'VSB'},
        deps: {
            develop: ['watch.less', 'jassa', 'locale']
        },
        webserver:{
            ghostMode: false,
            notify: false
        }
    }
);


/**
 * Alias Tasks
 */

gulp.task('default', ['build', 'jshint']);

gulp.task('watch.less', ['less'], function () {
    $.watch('app/**/*.less', function () {
        gulp.start('less');
    });
});

gulp.task('less', function () {
    return gulp.src(['app/styles/styles.less','app/styles/develop.less'])
        .pipe($.plumber($.errorHandler))
        .pipe($.concat('styles.less'))
        .pipe($.less())
        .pipe($.cssMinify())
        .pipe(gulp.dest('app/styles/'))
        .pipe($.reload({stream: true}))

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