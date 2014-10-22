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
        filter: ['{f,F}ont*.{otf,eot,svg,ttf,woff}']
    },
    {
        name: 'images',
        folder: 'dist/images',
        src: ['app/images/*'],
        pipe: $.lazypipe().pipe($.imagemin)
    }
];

var overWriteJS = function(){
    return gulp.src('app/overwrite.js');
};


var bowerCSS = function(){
    console.warn($.less);
    return gulp.src('app/css/styles.less').pipe($.less()).pipe(gulp.dest('.tmp/css/'));
};

var gulp = require('gulp-stack').gulp([
        'clean',
        'test',
        'app',
        'vendor',
        'static',
        'develop',
        'html'
    ],
    {
        files : {
            js: 'app/js/**/*.js',
            css: ['app/css/**/*.css','.tmp/css/**/*.css'],
            vendor: [],
            partials: 'app/template/**/*.html',
            test: [],
            static: staticFiles
        },
        injectInto: {
            css: bowerCSS,
            js:  overWriteJS
        },
        bower: 'app/bower_components/**', // String of bower directory string
        templateCacheOptions: {root: 'template/', module: 'GSB'}
    }
);

/**
 * Alias Tasks
 */

//gulp.newTask('default', ['build', 'jshint', 'test']);
gulp.newTask('default', ['build', 'jshint']);

gulp.newTask('build', ['html', 'app', 'static', 'vendor']);

gulp.task('dev',['develop'],function(){
    bowerCSS();
});