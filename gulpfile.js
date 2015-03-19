'use strict';

var $ = require('gulp-stack').plugins;

$.less = require('gulp-less');
var staticFiles = [
    {
        name: 'locales',
        folder: 'dist/',
        src: ['app/locale.json']
    },
    {
        name: 'jassa',
        folder: 'dist/bower_components/jassa',
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
        src: ['app/images/*'],
        pipe: $.lazypipe().pipe($.imagemin)
    }
];

var overWriteJS = function () {
    return gulp.src('app/overwrite.js');
};


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
            css: bowerCSS,
            js: overWriteJS
        },
        bower: 'app/bower_components/**', // String of bower directory string
        templateCacheOptions: {root: '/', module: 'GSB'}
    }
);

/**
 * Alias Tasks
 */

//gulp.newTask('default', ['build', 'jshint', 'test']);
gulp.newTask('default', ['build', 'jshint']);

gulp.newTask('build', ['html', 'app', 'static', 'vendor']);

gulp.task('dev', ['develop','watch.less','less']);

gulp.task('watch.less', ['less'], function(){
    $.watch('app/**/*.less',function(){
        gulp.start('less');
    })
});

gulp.task('less',function(){
    return gulp.src('app/styles/styles.less')
        .pipe($.less())
        .pipe(gulp.dest('app/styles/'));
});