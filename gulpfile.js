'use strict';

var $ = require('gulp-stack').plugins;
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
        name: 'images',
        folder: 'dist/images',
        src: ['app/images/*'],
        pipe: $.lazypipe().pipe($.imagemin)
    }
];

var overWriteJS = function(){
    return gulp.src('app/overwrite.js');
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
            css: 'app/css/**/*.css',
            vendor: [],
            partials: 'app/template/**/*.html',
            test: [],
            static: staticFiles
        },
        injectInto: {
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
