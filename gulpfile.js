'use strict';

var $ = require('gulp-stack').plugins;

$.less = require('gulp-less');
var staticFiles = [
    {
        name: 'locales',
        folder: 'dist/',
        src: 'app/locale.json'
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
            js: ['app/**/*.js'],
            static: staticFiles
        },
        injectInto: {
            css: bowerCSS
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

gulp.task('dev', ['develop', 'watch.less', 'less', 'jassa']);

gulp.task('watch.less', ['less'], function () {
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

gulp.task('jassa', function(){
    return gulp.src('app/bower_components/jassa/*.min.js')
        .pipe(gulp.dest('.tmp/scripts/'))
});